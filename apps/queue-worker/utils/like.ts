import { cacheDelPattern } from "@devhub/redis";
import { sanityClient } from "../../server/src/sanity";

export default async function LikeResource(userId: string, resourceId: string) {
	const doc = {
		_type: "likes",
		userId,
		resourceId,
		likedAt: new Date().toISOString(),
	};

	const result = await sanityClient.create(doc);
	console.log("Resource created in Sanity:", result._id);

	// Invalidate user-specific likes cache
	await cacheDelPattern(`*${userId}*`);
}
