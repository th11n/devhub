# Sanity → Discord review webhook

Resources submitted through Devhub now reach Discord through RabbitMQ immediately; this webhook is the fallback for resources created or changed manually in Sanity Studio.

- **URL:** `https://<public-bot-host>/webhook/sanity`
- **Trigger on:** Create and update
- **Filter:** `_type == "resource" && status == "review"`
- **HTTP header:** `x-sanity-secret: <SANITY_WEBHOOK_SECRET>`
- **Projection:**

```groq
{
  "_id": _id,
  "_type": _type,
  "name": name,
  "description": description,
  "link": link,
  "logoUrl": logo.asset->url,
  "status": status,
  "_createdAt": _createdAt
}
```

The bot now also synchronizes all `review` resources on startup. It stores the Discord message ID per Sanity resource in Redis, so a replayed webhook or restart does not create duplicate review cards.
