import { consumeJSON, publishJSON } from "@devhub/queue";
import { cacheDel } from "@devhub/redis";
import { enrichResource } from "../utils/enrichment";
import LikeResource from "../utils/like";

type EnrichJob = {
	url: string;
	categoryId: string;
	source?: "web" | "pwa" | "shortcut";
	dedupeKey?: string;
};

type LikeJob = {
	userId: string;
	resourceId: string;
};

type ReviewJob = {
	id: string;
	name?: string;
	description?: string;
	link?: string;
	createdAt?: string;
};

const baseCfg = {
	url: process.env.RABBITMQ_URL || "amqp://dev:dev@localhost:5672",
	prefetch: 5,
	durable: true,
};

const enrichCfg = { ...baseCfg, queue: "resource_enrich" };
const likeCfg = { ...baseCfg, queue: "resource_like" };
const reviewCfg = { ...baseCfg, queue: "resource_review" };

console.log(
	`[worker] starting. queues=${enrichCfg.queue}, ${likeCfg.queue}, ${reviewCfg.queue}`,
);

await Promise.all([
	consumeJSON<EnrichJob>(enrichCfg, async (job: EnrichJob) => {
		console.log("[worker:enrich] got job:", job);
		try {
			const resource = await enrichResource(job.url, job.categoryId);
			if (!("duplicate" in resource)) {
				await publishJSON<ReviewJob>(reviewCfg, resource);
			}
			console.log("[worker:enrich] done:", job.url);
		} catch (error) {
			if (job.dedupeKey) await cacheDel(job.dedupeKey);
			throw error;
		}
	}),
	consumeJSON<LikeJob>(likeCfg, async (job: LikeJob) => {
		console.log("[worker:like] got job:", job);
		await LikeResource(job.userId, job.resourceId);
		console.log("[worker:like] done:", job.userId, job.resourceId);
	}),
]);
