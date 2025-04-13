"use server";

import { z } from "zod";
import { ResourceService } from "@/lib/services/resource-service";

const resourceSchema = z.object({
  url: z.string().url(),
  category: z.string(),
});

export async function createResource(formData: FormData): Promise<void> {
  const raw = {
    url: formData.get("url")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "",
  };

  const parsed = resourceSchema.safeParse(raw);

  if (!parsed.success) {
    console.error("Validation failed", parsed.error.flatten().fieldErrors);
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
