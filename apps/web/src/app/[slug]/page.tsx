import { Suspense } from "react";
import CategoriesRow from "@/components/categories-row";
import ResourceCard from "@/components/resource-card";
import {
	CategoriesRowSkeleton,
	ResourceGridSkeleton,
} from "@/components/skeletons";
import { getSession } from "@/lib/auth";
import { fetchWithCache } from "@/lib/cache";
import {
	CATEGORY_RESOURCES_QUERY,
	USER_LIKES_QUERY,
} from "@/lib/sanity-queries";

export default async function CategoryPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ q?: string }>;
}) {
	const { slug } = await params;
	const { q: query } = await searchParams;
	const session = await getSession();

	// Fetch resources for this category
	// If a search query is provided, we'll filter on the client for now or could create a combined query.
	// Given the previous requirement "w tamtym search tez musi dzialac", let's handle it.

	let resources = await fetchWithCache<any[]>(CATEGORY_RESOURCES_QUERY, {
		slug,
	});

	if (query) {
		const lowerQuery = query.toLowerCase();
		resources = resources.filter(
			(res) =>
				res.name.toLowerCase().includes(lowerQuery) ||
				(res.description && res.description.toLowerCase().includes(lowerQuery)),
		);
	}

	const userLikes = session?.user?.id
		? await fetchWithCache<{ resourceId: string }[]>(USER_LIKES_QUERY, {
				userId: session.user.id,
			})
		: [];

	const likedResourceIds = new Set(userLikes.map((like) => like.resourceId));

	const categoryName = slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return (
		<main className="flex flex-col items-center">
			<div className="flex w-full flex-col items-center justify-center gap-12 px-4 pt-48 pb-12 text-center">
				<div className="space-y-4">
					<h1 className="font-light text-4xl capitalize tracking-tight md:text-8xl">
						{categoryName}
					</h1>
					<p className="mx-auto max-w-2xl font-thin text-foreground/75 text-xl md:text-2xl">
						Best curated resources for{" "}
						<span className="font-normal text-primary italic">
							{categoryName}
						</span>
						.
						{query && (
							<span>
								{" "}
								Showing results for <span className="italic">"{query}"</span>
							</span>
						)}
					</p>
				</div>
				<Suspense fallback={<CategoriesRowSkeleton />}>
					<CategoriesRow />
				</Suspense>
			</div>

			<section className="container mx-auto px-4 py-24">
				{resources.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-6 rounded-[2rem] border-2 border-border/50 border-dashed bg-muted/5 py-24">
						<p className="px-4 text-center font-light text-2xl text-muted-foreground leading-relaxed">
							No resources found {query ? `matching "${query}" ` : ""}in this
							category.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{resources.map((resource) => (
							<ResourceCard
								key={resource._id}
								resource={resource}
								isFavorited={likedResourceIds.has(resource._id)}
							/>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
