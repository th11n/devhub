import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

import { startDiscord } from "./discord";

import { startWebhookServer } from "./webhook";

async function main() {
    await startDiscord();
    startWebhookServer();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
