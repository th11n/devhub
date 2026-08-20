import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

import {
	postReviewMessage,
	startDiscord,
	startReviewConsumer,
} from "./discord";
import { getResourcesAwaitingReview } from "./sanity";

import { startWebhookServer } from "./webhook";

async function main() {
	await startDiscord();
	await startReviewConsumer();
	startWebhookServer();

	const pendingResources = await getResourcesAwaitingReview();
	for (const resource of pendingResources) {
		await postReviewMessage(resource);
	}
	console.log(
		`[bot] synced ${pendingResources.length} resources awaiting review`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
