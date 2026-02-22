import { cacheGet, cacheSet } from "@devhub/redis";
import { client } from "./sanity-client";

export async function fetchWithCache<T>(
	query: string,
	params: Record<string, any> = {},
	ttl = 3600,
): Promise<T> {
	const cacheKey = `sanity:${query}:${JSON.stringify(params)}`;

	// Try to get from Redis
	const cached = await cacheGet<T>(cacheKey);
	if (cached) {
		console.log(`[cache] hit: ${cacheKey}`);
		return cached;
	}

	// Fetch from Sanity
	console.log(`[cache] miss: ${cacheKey}`);
	const data = await client.fetch<T>(query, params);

	// Store in Redis
	await cacheSet(cacheKey, data, ttl);

	return data;
}
