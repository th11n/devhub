"use server";

import { ResourceService } from "@/lib/services/resource-service";
import { Resource } from "@/types/resource";

export async function getResources(
  pageParam: number,
  category: string | null
): Promise<{ data: Resource[]; pageCount: number }> {
  try {
    const resourceService = new ResourceService();
    return await resourceService.getResources(pageParam, category, "published");
  } catch (err) {
    console.error("Unexpected error", err);
    return { data: [], pageCount: 0 };
  }
}
