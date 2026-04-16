"use server";

import { getSession } from "@/lib/auth";
import { fetchWithCache } from "@/lib/cache";
import { PAGINATED_RESOURCES_QUERY, USER_LIKES_QUERY } from "@/lib/sanity-queries";

export async function loadMoreResources(offset: number, limit: number) {
	try {
		const [resources, session] = await Promise.all([
			fetchWithCache<any[]>(PAGINATED_RESOURCES_QUERY, {
				start: offset,
				end: offset + limit,
			}),
			getSession(),
		]);

		const userLikes = session?.user?.id
			? await fetchWithCache<{ resourceId: string }[]>(USER_LIKES_QUERY, {
					userId: session.user.id,
				})
			: [];

		const likedResourceIds = new Set(userLikes.map((like) => like.resourceId));

		return resources.map((resource) => ({
			...resource,
			isFavorited: likedResourceIds.has(resource._id),
		}));
	} catch (error) {
		console.error("Failed to load more resources", error);
		return [];
	}
}
