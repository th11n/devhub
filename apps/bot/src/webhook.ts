import express from "express";
import { postReviewMessage } from "./discord";

type SanityWebhookPayload = {
	_id: string;
	_type?: string;
	title?: string;
	description?: string;
	url?: string;
	logoUrl?: string;
	status?: string;
	submittedBy?: string;
	_createdAt?: string;
};

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

			// minimalna walidacja
			if (!body?._id)
				return res.status(400).json({ ok: false, error: "Missing _id" });

			// filtr: tylko rzeczy do review
			if (body.status && body.status !== "review") {
				return res
					.status(200)
					.json({ ok: true, skipped: true, reason: "status!=review" });
			}

			await postReviewMessage({
				id: body._id,
				title: body.title,
				description: body.description,
				url: body.url,
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

	app.listen(process.env.PORT, () => {
		// eslint-disable-next-line no-console
		console.log(`Webhook server listening on :${process.env.PORT}`);
	});
}
