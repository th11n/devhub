"use client";

export type ResourceCategory = { _id: string; name: string };
export type SubmissionSource = "web" | "pwa" | "shortcut";

type PendingSubmission = {
	id: string;
	url: string;
	categoryId: string;
	createdAt: string;
	retryAt?: number;
	error?: string;
};

type SubmissionResult =
	| { state: "submitted" | "duplicate" }
	| { state: "queued"; reason: "offline" | "rate_limited" | "network" };

const databaseName = "devhub-submissions";
const databaseVersion = 1;
const pendingStore = "pending";
const categoryStore = "categories";

function apiUrl(path: string) {
	return `${process.env.NEXT_PUBLIC_SERVER_URL}${path}`;
}

function database() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(databaseName, databaseVersion);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(pendingStore)) {
				db.createObjectStore(pendingStore, { keyPath: "id" });
			}
			if (!db.objectStoreNames.contains(categoryStore)) {
				db.createObjectStore(categoryStore, { keyPath: "id" });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function put(storeName: string, value: unknown) {
	const db = await database();
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(storeName, "readwrite");
		transaction.objectStore(storeName).put(value);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

async function all<T>(storeName: string) {
	const db = await database();
	return new Promise<T[]>((resolve, reject) => {
		const request = db
			.transaction(storeName, "readonly")
			.objectStore(storeName)
			.getAll();
		request.onsuccess = () => resolve(request.result as T[]);
		request.onerror = () => reject(request.error);
	});
}

async function remove(storeName: string, id: string) {
	const db = await database();
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(storeName, "readwrite");
		transaction.objectStore(storeName).delete(id);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

async function postSubmission(
	submission: Pick<PendingSubmission, "url" | "categoryId">,
) {
	const response = await fetch(apiUrl("/api/quick-add"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			...submission,
			source: "pwa" satisfies SubmissionSource,
		}),
	});

	if (response.ok) return { ok: true as const };
	const payload = await response.json().catch(() => ({}));
	return {
		ok: false as const,
		status: response.status,
		retryAfter: Number(response.headers.get("retry-after") || 0),
		error: payload.error || "Unable to submit this resource.",
	};
}

export async function cacheCategories(categories: ResourceCategory[]) {
	await put(categoryStore, { id: "latest", categories, updatedAt: Date.now() });
}

export async function getCachedCategories() {
	const records = await all<{ categories: ResourceCategory[] }>(categoryStore);
	return records[0]?.categories || [];
}

async function enqueue(
	url: string,
	categoryId: string,
	error?: string,
	retryAt?: number,
) {
	await put(pendingStore, {
		id: crypto.randomUUID(),
		url,
		categoryId,
		createdAt: new Date().toISOString(),
		error,
		retryAt,
	} satisfies PendingSubmission);
}

export async function submitFromPwa(
	url: string,
	categoryId: string,
): Promise<SubmissionResult> {
	if (!navigator.onLine) {
		await enqueue(url, categoryId);
		return { state: "queued", reason: "offline" };
	}

	try {
		const result = await postSubmission({ url, categoryId });
		if (result.ok) return { state: "submitted" };
		if (result.status === 429) {
			await enqueue(
				url,
				categoryId,
				result.error,
				Date.now() + result.retryAfter * 1000,
			);
			return { state: "queued", reason: "rate_limited" };
		}
		throw new Error(result.error);
	} catch (error) {
		if (error instanceof TypeError) {
			await enqueue(url, categoryId);
			return { state: "queued", reason: "network" };
		}
		throw error;
	}
}

export async function getPendingSubmissions() {
	return (await all<PendingSubmission>(pendingStore)).sort((a, b) =>
		a.createdAt.localeCompare(b.createdAt),
	);
}

export async function removePendingSubmission(id: string) {
	await remove(pendingStore, id);
}

export async function flushPendingSubmissions() {
	if (!navigator.onLine)
		return { sent: 0, pending: (await getPendingSubmissions()).length };

	let sent = 0;
	for (const submission of await getPendingSubmissions()) {
		if (submission.retryAt && submission.retryAt > Date.now()) continue;
		try {
			const result = await postSubmission(submission);
			if (result.ok) {
				await removePendingSubmission(submission.id);
				sent++;
				continue;
			}
			if (result.status === 429) {
				await put(pendingStore, {
					...submission,
					retryAt: Date.now() + result.retryAfter * 1000,
					error: result.error,
				});
				continue;
			}
			await put(pendingStore, {
				...submission,
				error: result.error,
				retryAt: undefined,
			});
		} catch {
			break;
		}
	}

	return { sent, pending: (await getPendingSubmissions()).length };
}
