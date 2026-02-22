import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis() {
	if (redis) return redis;

	redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
		maxRetriesPerRequest: null,
	});

	redis.on("error", (e) => console.error("[redis] error", e));
	return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
	const client = getRedis();
	const val = await client.get(key);
	if (!val) return null;
	try {
		return JSON.parse(val) as T;
	} catch {
		return null;
	}
}

export async function cacheSet(key: string, value: any, ttlSeconds = 3600) {
	const client = getRedis();
	await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(key: string) {
	const client = getRedis();
	await client.del(key);
}

export async function cacheDelPattern(pattern: string) {
	const client = getRedis();
	const stream = client.scanStream({ match: pattern });
	stream.on("data", (keys: string[]) => {
		if (keys.length) {
			client.del(...keys);
		}
	});
}
