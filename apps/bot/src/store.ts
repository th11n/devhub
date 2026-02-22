import { cacheDelPattern, cacheGet, cacheSet } from "@devhub/redis";

export type PendingResource = {
	id: string;
	title?: string;
	description?: string;
	url?: string;
	logoUrl?: string;
	submittedBy?: string;
	createdAt?: string;
};

// Keys will be stored as `discord:pending:${messageId}`

export const store = {
	async set(messageId: string, data: PendingResource) {
		// expire after e.g., 7 days (7 * 24 * 60 * 60 = 604800 seconds)
		await cacheSet(`discord:pending:${messageId}`, data, 604800);
	},
	async get(messageId: string): Promise<PendingResource | null> {
		return await cacheGet<PendingResource>(`discord:pending:${messageId}`);
	},
	async delete(messageId: string) {
		await cacheDelPattern(`discord:pending:${messageId}`);
	},
};
