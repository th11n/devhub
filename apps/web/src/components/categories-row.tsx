import Link from "next/link";
import type { SanityDocument } from "next-sanity";
import { fetchWithCache } from "@/lib/cache";
import { CATEGORIES_QUERY } from "@/lib/sanity-queries";

export default async function CategoriesRow() {
	const categories = await fetchWithCache<SanityDocument[]>(
		CATEGORIES_QUERY,
		{},
	);

	return (
		<div className="mt-12 inline-flex flex-wrap gap-4">
			{categories.map((category) => (
				<Link
					className="rounded-xs bg-accent px-2.5 py-1 transition-colors hover:bg-accent/80"
					key={category._id}
					href={`/${category.slug}` as any}
				>
					{category.name}
				</Link>
			))}
		</div>
	);
}
