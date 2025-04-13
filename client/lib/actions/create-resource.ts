"use server";

import { z } from "zod";
import { ResourceService } from "@/lib/services/resource-service";
import { validateTurnstileToken } from "next-turnstile";
import { v4 } from "uuid";

const resourceSchema = z.object({
  url: z.string().url(),
  category: z.string(),
  token: z.string()
});

export async function createResource(formData: FormData): Promise<void> {
  const raw = {
    url: formData.get("url")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "",
    token: formData.get("token")?.toString() ?? "",
  };

  const parsed = resourceSchema.safeParse(raw);
  const token = raw.token

  if (!parsed.success) {
    console.error("Validation failed", parsed.error.flatten().fieldErrors);
    return;
  }

  const validationResponse = await validateTurnstileToken({
    token,
    secretKey: process.env.TURNSTILE_SECRET_KEY!,
    // Optional: Add an idempotency key to prevent token reuse
    idempotencyKey: v4(),
    sandbox: process.env.NODE_ENV === "development",
  });

  if (!validationResponse.success) {
    console.error("Invalid token",);
    return;
  }

  try {
    const resourceService = new ResourceService();
    const metadata = await resourceService.getMetadata(parsed.data.url);

    await resourceService.createResource({
      ...parsed.data,
      title: metadata?.title ?? parsed.data.url,
      body: metadata?.description ?? "",
      image: typeof metadata?.image === "string" ? metadata.image : "",
      status: "awaiting",
    });
  } catch (err) {
    console.error("Unexpected error", err);
    return;
  }
}
