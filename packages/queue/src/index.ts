import amqp, { type Channel, type Connection, type Options } from "amqplib";

let conn: Connection | null = null;
const channels: Map<string, Channel> = new Map();

export type QueueConfig = {
	url: string;
	queue: string;
	prefetch?: number;
	durable?: boolean;
};

export async function getChannel(cfg: QueueConfig) {
	if (channels.has(cfg.queue)) return channels.get(cfg.queue)!;

	if (!conn) {
		conn = await amqp.connect(cfg.url);
	}
	const ch = await conn.createChannel();

	const durable = cfg.durable ?? true;
	await ch.assertQueue(cfg.queue, { durable });

	if (cfg.prefetch) ch.prefetch(cfg.prefetch);

	channels.set(cfg.queue, ch);

	const close = async () => {
		try {
			for (const c of channels.values()) await c.close();
		} catch {}
		try {
			await conn?.close();
		} catch {}
		channels.clear();
		conn = null;
	};

	process.on("SIGINT", close);
	process.on("SIGTERM", close);

	return ch;
}

export async function publishJSON<T>(
	cfg: QueueConfig,
	payload: T,
	opts?: Options.Publish,
) {
	const channel = await getChannel(cfg);
	const buf = Buffer.from(JSON.stringify(payload), "utf8");

	const ok = channel.sendToQueue(cfg.queue, buf, {
		contentType: "application/json",
		persistent: true,
		...opts,
	});

	return ok;
}

export type ConsumeHandler<T> = (msg: T) => Promise<void>;

export async function consumeJSON<T>(
	cfg: QueueConfig,
	handler: ConsumeHandler<T>,
) {
	const channel = await getChannel(cfg);

	await channel.consume(cfg.queue, async (m) => {
		if (!m) return;

		try {
			const parsed = JSON.parse(m.content.toString("utf8")) as T;
			await handler(parsed);
			channel.ack(m);
		} catch (err) {
			console.error("[queue] handler error:", err);
			channel.nack(m, false, false);
		}
	});
}
