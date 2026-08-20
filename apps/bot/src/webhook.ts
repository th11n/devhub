import express from "express";
import { postReviewMessage } from "./discord";

type SanityWebhookPayload = {
	_id: string;
	_type?: string;
	name?: string;
	description?: string;
	link?: string;
	logoUrl?: string;
	status?: string;
	submittedBy?: string;
	_createdAt?: string;
};

const port = Number(process.env.WEBHOOK_PORT ?? 3000);

export function startWebhookServer() {
	const app = express();

	// Sanity często wysyła JSON
	app.use(express.json({ limit: "1mb" }));

	app.get("/health", (_, res) => res.status(200).send("ok"));

	app.post("/webhook/sanity", async (req, res) => {
		try {
			// prosta weryfikacja secret (np. nagłówek)
			const secret = req.header("x-sanity-secret");
			if (
				process.env.SANITY_WEBHOOK_SECRET &&
				secret !== process.env.SANITY_WEBHOOK_SECRET
			) {
				return res.status(401).json({ ok: false, error: "Unauthorized" });
			}

			const body = req.body as SanityWebhookPayload;

			if (!body?._id || body._type !== "resource") {
				return res.status(200).json({ ok: true, skipped: true });
			}

			// filtr: tylko rzeczy do review
			if (body.status && body.status !== "review") {
				return res
					.status(200)
					.json({ ok: true, skipped: true, reason: "status!=review" });
			}

			await postReviewMessage({
				id: body._id,
				name: body.name,
				description: body.description,
				link: body.link,
				logoUrl: body.logoUrl,
				submittedBy: body.submittedBy,
				createdAt: body._createdAt,
			});

			return res.status(200).json({ ok: true });
		} catch (e: any) {
			return res
				.status(500)
				.json({ ok: false, error: e?.message ?? String(e) });
		}
	});

	app.listen(port, "0.0.0.0", () => {
		console.log(`Webhook server listening on :${port}`);
	});
}
