import { getSession } from "@/lib/auth";
import { fetchWithCache } from "@/lib/cache";
import { RESOURCES_QUERY, USER_LIKES_QUERY } from "@/lib/sanity-queries";
import InfiniteResourcesGrid from "./infinite-resources-grid";

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

	const initialResources = resources.map((resource) => ({
		...resource,
		isFavorited: likedResourceIds.has(resource._id),
	}));

	return (
		<section className="container mx-auto px-4 py-24">
			<InfiniteResourcesGrid initialResources={initialResources} />
		</section>
	);
}
