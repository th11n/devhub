import crypto from "node:crypto";
import { auth } from "@devhub/auth";
import { env } from "@devhub/env/server";
import { publishJSON } from "@devhub/queue";
import { incrementWithExpiry, reserveKey } from "@devhub/redis";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { sanityClient } from "./sanity";

type SubmissionSource = "web" | "pwa" | "shortcut";
type EnrichJob = {
	url: string;
	categoryId: string;
	source: SubmissionSource;
	dedupeKey: string;
};
type LikeJob = { userId: string; resourceId: string };

const baseCfg = {
	url: process.env.RABBITMQ_URL || "amqp://dev:dev@localhost:5672",
	durable: true,
};

const enrichCfg = { ...baseCfg, queue: "resource_enrich" };
const likeCfg = { ...baseCfg, queue: "resource_like" };
const submissionWindowSeconds = 60 * 60;
const submissionLimit = 10;
const duplicateWindowSeconds = 60 * 60 * 24;

function normalizeUrl(value: string) {
	const url = new URL(value.trim());
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error("Only HTTP and HTTPS URLs can be submitted");
	}

	url.hash = "";
	url.hostname = url.hostname.toLowerCase();
	if (
		(url.protocol === "https:" && url.port === "443") ||
		(url.protocol === "http:" && url.port === "80")
	) {
		url.port = "";
	}
	return url.toString();
}

function clientIp(headers: Headers) {
	return (
		headers.get("cf-connecting-ip") ||
		headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		"unknown"
	);
}

async function categoryExists(categoryId: string) {
	return Boolean(
		await sanityClient.fetch<string | null>(
			'*[_id == $categoryId && _type == "resourceCategory"][0]._id',
			{ categoryId },
		),
	);
}

type SubmissionContext = {
	body: { url: string; categoryId: string; source?: SubmissionSource };
	request: Request;
	set: { status?: number | string; headers: Record<string, string | number> };
};

async function handleSubmission({ body, request, set }: SubmissionContext) {
	try {
		const { url, categoryId, source = "web" } = body;

		const ip = clientIp(request.headers);
		const attempts = await incrementWithExpiry(
			`rate-limit:submission:${ip}`,
			submissionWindowSeconds,
		);
		if (attempts > submissionLimit) {
			set.status = 429;
			set.headers["retry-after"] = String(submissionWindowSeconds);
			return { error: "Too many submissions. Please try again later." };
		}

		let normalizedUrl: string;
		try {
			normalizedUrl = normalizeUrl(url);
		} catch (error) {
			set.status = 400;
			return { error: error instanceof Error ? error.message : "Invalid URL" };
		}

		if (!(await categoryExists(categoryId))) {
			set.status = 400;
			return { error: "The selected category no longer exists" };
		}

		const fingerprint = crypto
			.createHash("sha256")
			.update(normalizedUrl)
			.digest("hex");
		const dedupeKey = `submission:url:${fingerprint}`;
		if (!(await reserveKey(dedupeKey, duplicateWindowSeconds))) {
			return {
				success: true,
				status: "duplicate",
				message: "This URL is already being reviewed.",
			};
		}

		const result = await publishJSON<EnrichJob>(enrichCfg, {
			url: normalizedUrl,
			categoryId,
			source,
			dedupeKey,
		});

		set.status = 202;
		return {
			success: true,
			status: "queued",
			message: "Resource submitted for review",
			data: result,
		};
	} catch (error: any) {
		console.error("Submission error:", error);
		set.status = 500;
		return {
			success: false,
			error: error.message || "Internal Server Error",
		};
	}
}

const submissionBody = t.Object({
	url: t.String(),
	categoryId: t.String(),
	source: t.Optional(
		t.Union([t.Literal("web"), t.Literal("pwa"), t.Literal("shortcut")]),
	),
});

new Elysia()
	.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/api/auth/*", async (context) => {
		const { request, status } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return status(405);
	})
	.get("/api/categories", async () => {
		const categories = await sanityClient.fetch<
			{ _id: string; name: string }[]
		>(
			'*[_type == "resourceCategory" && defined(slug.current)]|order(name asc){_id, name}',
		);
		return { categories };
	})
	.post("/api/submit", handleSubmission, { body: submissionBody })
	.post("/api/quick-add", handleSubmission, { body: submissionBody })
	.post(
		"/api/like",
		async ({ body, set }) => {
			try {
				const { userId, resourceId } = body;

				if (!userId || !resourceId) {
					set.status = 400;
					return { error: "User ID and Resource ID are required" };
				}

				const result = await publishJSON<LikeJob>(likeCfg, {
					userId,
					resourceId,
				});

				return {
					success: true,
					message: "Like submitted successfully",
					data: result,
				};
			} catch (error: any) {
				console.error("Like error:", error);
				set.status = 500;
				return {
					success: false,
					error: error.message || "Internal Server Error",
				};
			}
		},
		{
			body: t.Object({
				userId: t.String(),
				resourceId: t.String(),
			}),
		},
	)
	.get("/", () => "OK")
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
