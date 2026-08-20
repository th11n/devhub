import { cacheDelPattern, cacheGet, cacheSet } from "@devhub/redis";

export type PendingResource = {
	id: string;
	name?: string;
	description?: string;
	link?: string;
	categoryName?: string;
	logoUrl?: string;
	submittedBy?: string;
	createdAt?: string;
};

const ttlSeconds = 7 * 24 * 60 * 60;

export const store = {
	async set(messageId: string, data: PendingResource) {
		await cacheSet(`discord:pending:${messageId}`, data, ttlSeconds);
		await cacheSet(
			`discord:pending-resource:${data.id}`,
			messageId,
			ttlSeconds,
		);
	},
	async get(messageId: string): Promise<PendingResource | null> {
		return await cacheGet<PendingResource>(`discord:pending:${messageId}`);
	},
	async messageIdForResource(resourceId: string) {
		return await cacheGet<string>(`discord:pending-resource:${resourceId}`);
	},
	async delete(messageId: string) {
		const resource = await this.get(messageId);
		await cacheDelPattern(`discord:pending:${messageId}`);
		if (resource)
			await cacheDelPattern(`discord:pending-resource:${resource.id}`);
	},
};
