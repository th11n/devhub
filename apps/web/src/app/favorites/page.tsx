import { Button } from "@devhub/ui/components/button";
import Link from "next/link";
import ResourceCard from "@/components/resource-card";
import { getSession } from "@/lib/auth";
import { fetchWithCache } from "@/lib/cache";
import { RESOURCES_BY_IDS_QUERY, USER_LIKES_QUERY } from "@/lib/sanity-queries";

export default async function FavoritesPage() {
	const session = await getSession();

	if (!session) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
				<h1 className="font-light text-4xl tracking-tight md:text-5xl">
					Your Favorites
				</h1>
				<p className="max-w-md text-muted-foreground text-xl">
					Please sign in to view and manage your saved resources.
				</p>
				<Button
					asChild
					className="rounded-2xl px-8 py-6 text-lg transition-all hover:scale-105"
				>
					<Link href="/">Back to Home</Link>
				</Button>
			</div>
		);
	}

	const userLikes = await fetchWithCache<{ resourceId: string }[]>(
		USER_LIKES_QUERY,
		{ userId: session.user.id },
	);
	const likedIds = userLikes.map((like) => like.resourceId);

	const resources =
		likedIds.length > 0
			? await fetchWithCache<any[]>(RESOURCES_BY_IDS_QUERY, { ids: likedIds })
			: [];

	return (
		<main className="container mx-auto px-4 py-32">
			<div className="mb-16 flex flex-col gap-12 px-4">
				<div className="space-y-4">
					<h1 className="font-light text-5xl tracking-tight md:text-7xl">
						Favorites
					</h1>
					<p className="max-w-2xl font-light text-muted-foreground text-xl">
						Explore your curated collection of resources. You have{" "}
						{resources.length} item{resources.length === 1 ? "" : "s"} saved.
					</p>
				</div>
			</div>

			{resources.length === 0 ? (
				<div className="mx-4 flex flex-col items-center justify-center gap-6 rounded-[2rem] border-2 border-border/50 border-dashed bg-muted/5 py-24">
					<p className="px-4 text-center font-light text-2xl text-muted-foreground leading-relaxed">
						You haven't added anything to your favorites yet.
					</p>
					<Button
						asChild
						variant="outline"
						className="h-12 rounded-xl border-border/50 px-8 transition-all hover:bg-primary hover:text-primary-foreground"
					>
						<Link href="/">Discover Resources</Link>
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
					{resources.map((resource) => (
						<ResourceCard
							key={resource._id}
							resource={resource}
							isFavorited={true}
						/>
					))}
				</div>
			)}
		</main>
	);
}
