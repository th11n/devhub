"use server";

import { ResourceService } from "@/lib/services/resource-service";

export async function getCategories(): Promise<string[]> {
  try {
    const resourceService = new ResourceService();
    return await resourceService.getCategories();
  } catch (err) {
    console.error("Unexpected error", err);
    return [];
  }
}
