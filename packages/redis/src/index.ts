import Redis from "ioredis";

let redis: Redis | null = null;

function isNextBuildTime() {
	// Next build phase env var (często obecny)
	if (process.env.NEXT_PHASE === "phase-production-build") return true;

	// fallback: kiedy bun odpala "build"
	if (process.env.npm_lifecycle_event === "build") return true;

	// opcjonalny kill-switch, jakbyś chciał sterować w CI
	if (process.env.SKIP_REDIS_DURING_BUILD === "1") return true;

	return false;
}

export function getRedis() {
	if (isNextBuildTime()) {
		// W buildzie NIE tworzymy klienta (ioredis spróbuje się połączyć)
		return null;
	}

	if (redis) return redis;

	const url = process.env.REDIS_URL;
	if (!url) {
		throw new Error("REDIS_URL is missing. Set REDIS_URL=redis://redis:6379 (docker) or your provider URL.");
	}

	redis = new Redis(url, {
		maxRetriesPerRequest: null,
		// jeśli chcesz szybciej failować w runtime:
		// connectTimeout: 5000,
		// enableReadyCheck: true,
	});

	redis.on("error", (e) => console.error("[redis] error", e));
	return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
	const client = getRedis();
	if (!client) return null; // build-time: cache disabled

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
	if (!client) return; // build-time: cache disabled

	await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(key: string) {
	const client = getRedis();
	if (!client) return;

	await client.del(key);
}

export async function cacheDelPattern(pattern: string) {
	const client = getRedis();
	if (!client) return;

	const stream = client.scanStream({ match: pattern });
	stream.on("data", (keys: string[]) => {
		if (keys.length) client.del(...keys);
	});
}