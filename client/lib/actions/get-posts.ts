"use server";

import { ResourceService } from "@/lib/services/resource-service";
import type { Resource } from "@/lib/services/resource-service";

export async function getPosts(
  pageParam: number,
  category: string | null
): Promise<{ data: Resource[]; pageCount: number }> {
  try {
    const resourceService = new ResourceService();
    return await resourceService.getPosts(pageParam, category, "published");
  } catch (err) {
    console.error("Unexpected error", err);
    return { data: [], pageCount: 0 };
  }
}
