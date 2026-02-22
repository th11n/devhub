import ResourceCard from "@/components/resource-card";
import { getSession } from "@/lib/auth";
import { fetchWithCache } from "@/lib/cache";
import { SEARCH_RESOURCES_QUERY, USER_LIKES_QUERY } from "@/lib/sanity-queries";

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	const { q: query } = await searchParams;
	const session = await getSession();

	if (!query) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
				<h1 className="font-light text-4xl tracking-tight md:text-5xl">
					Search Resources
				</h1>
				<p className="max-w-md font-light text-muted-foreground text-xl">
					Enter a search term above to find the best curated resources.
				</p>
			</div>
		);
	}

	const [resources, userLikes] = await Promise.all([
		fetchWithCache<any[]>(SEARCH_RESOURCES_QUERY, { query: `*${query}*` }),
		session?.user?.id
			? fetchWithCache<{ resourceId: string }[]>(USER_LIKES_QUERY, {
					userId: session.user.id,
				})
			: Promise.resolve([]),
	]);

	const likedResourceIds = new Set(userLikes.map((like) => like.resourceId));

	return (
		<main className="container mx-auto px-4 py-32">
			<div className="mb-16 flex flex-col gap-12 px-4">
				<div className="space-y-4">
					<h1 className="max-w-full truncate pb-4 font-light text-5xl tracking-tight md:text-7xl">
						Search:{" "}
						<span className="font-thin text-primary/70 italic">{query}</span>
					</h1>
					<p className="max-w-2xl font-light text-muted-foreground text-xl">
						Found {resources.length} resource{resources.length === 1 ? "" : "s"}{" "}
						for your query.
					</p>
				</div>
			</div>

			{resources.length === 0 ? (
				<div className="mx-4 flex flex-col items-center justify-center gap-6 rounded-[2rem] border-2 border-border/50 border-dashed bg-muted/5 py-24">
					<p className="px-4 text-center font-light text-2xl text-muted-foreground leading-relaxed">
						We couldn't find anything matching{" "}
						<span className="font-normal text-foreground">"{query}"</span>.
						<br />
						Try searching for something else!
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
					{resources.map((resource) => (
						<ResourceCard
							key={resource._id}
							resource={resource}
							isFavorited={likedResourceIds.has(resource._id)}
						/>
					))}
				</div>
			)}
		</main>
	);
}
