import { consumeJSON } from "@devhub/queue";
import { enrichResource } from "../utils/enrichment";
import LikeResource from "../utils/like";

type EnrichJob = {
	url: string;
	categoryId: string;
};

type LikeJob = {
	userId: string;
	resourceId: string;
};

const baseCfg = {
	url: process.env.RABBITMQ_URL || "amqp://dev:dev@localhost:5672",
	prefetch: 5,
	durable: true,
};

const enrichCfg = { ...baseCfg, queue: "resource_enrich" };
const likeCfg = { ...baseCfg, queue: "resource_like" };

console.log(`[worker] starting. queues=${enrichCfg.queue}, ${likeCfg.queue}`);

await Promise.all([
	consumeJSON<EnrichJob>(enrichCfg, async (job: EnrichJob) => {
		console.log("[worker:enrich] got job:", job);
		await enrichResource(job.url, job.categoryId);
		console.log("[worker:enrich] done:", job.url);
	}),
	consumeJSON<LikeJob>(likeCfg, async (job: LikeJob) => {
		console.log("[worker:like] got job:", job);
		await LikeResource(job.userId, job.resourceId);
		console.log("[worker:like] done:", job.userId, job.resourceId);
	}),
]);
