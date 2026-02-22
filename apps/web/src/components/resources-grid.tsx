import { getSession } from "@/lib/auth";
import { fetchWithCache } from "@/lib/cache";
import { RESOURCES_QUERY, USER_LIKES_QUERY } from "@/lib/sanity-queries";
import ResourceCard from "./resource-card";

export default async function ResourcesGrid() {
	const [resources, session] = await Promise.all([
		fetchWithCache<any[]>(RESOURCES_QUERY, {}),
		getSession(),
	]);

	const userLikes = session?.user?.id
		? await fetchWithCache<{ resourceId: string }[]>(USER_LIKES_QUERY, {
				userId: session.user.id,
			})
		: [];

	const likedResourceIds = new Set(userLikes.map((like) => like.resourceId));

	return (
		<section className="container mx-auto px-4 py-24">
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{resources.map((resource) => (
					<ResourceCard
						key={resource._id}
						resource={resource}
						isFavorited={likedResourceIds.has(resource._id)}
					/>
				))}
			</div>
		</section>
	);
}
