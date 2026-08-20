import crypto from "node:crypto";

type PatchFields = {
	status?: "review" | "public" | "rejected";
	name?: string;
	description?: string;
	link?: string;
	categories?: { _type: "reference"; _ref: string; _key: string }[];
};

export type ReviewResource = {
	id: string;
	name?: string;
	description?: string;
	link?: string;
	logoUrl?: string;
	createdAt?: string;
};

export type ResourceCategory = { id: string; name: string };

function sanityUrl(path: string) {
	return `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v${process.env.SANITY_API_VERSION}/data/mutate/${process.env.SANITY_DATASET}${path}`;
}

export async function patchResource(resourceId: string, fields: PatchFields) {
	const mutations = [
		{
			patch: {
				id: resourceId,
				set: fields,
			},
		},
	];

	const res = await fetch(sanityUrl(""), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.SANITY_TOKEN}`,
		},
		body: JSON.stringify({ mutations }),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Sanity patch failed (${res.status}): ${text}`);
	}

	return res.json();
}

export async function getResourcesAwaitingReview() {
	const query = `*[_type == "resource" && status == "review"]|order(_createdAt asc){
		"id": _id,
		name,
		description,
		link,
		"logoUrl": logo.asset->url,
		"createdAt": _createdAt
	}`;
	const response = await fetch(
		`https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v${process.env.SANITY_API_VERSION}/data/query/${process.env.SANITY_DATASET}?query=${encodeURIComponent(query)}`,
		{ headers: { Authorization: `Bearer ${process.env.SANITY_TOKEN}` } },
	);
	if (!response.ok)
		throw new Error(`Sanity review query failed (${response.status})`);
	const payload = (await response.json()) as { result: ReviewResource[] };
	return payload.result;
}

export async function getResourceCategories() {
	const query = `*[_type == "resourceCategory"]|order(name asc){"id": _id, name}`;
	const response = await fetch(
		`https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v${process.env.SANITY_API_VERSION}/data/query/${process.env.SANITY_DATASET}?query=${encodeURIComponent(query)}`,
		{ headers: { Authorization: `Bearer ${process.env.SANITY_TOKEN}` } },
	);
	if (!response.ok)
		throw new Error(`Sanity category query failed (${response.status})`);
	const payload = (await response.json()) as { result: ResourceCategory[] };
	return payload.result;
}

export function categoryReference(categoryId: string) {
	return [
		{
			_type: "reference" as const,
			_ref: categoryId,
			_key: crypto.randomUUID(),
		},
	];
}
