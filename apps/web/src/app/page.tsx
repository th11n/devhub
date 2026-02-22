import { Suspense } from "react";
import CategoriesRow from "@/components/categories-row";
import ResourcesGrid from "@/components/resources-grid";
import {
	CategoriesRowSkeleton,
	ResourceGridSkeleton,
} from "@/components/skeletons";

export default async function IndexPage() {
	return (
		<main className="flex flex-col items-center">
			<div className="flex flex-col items-center justify-center gap-12 px-4 pt-48 pb-12 text-center">
				<h1 className="font-light text-4xl tracking-tight md:text-8xl">
					High Quality Curated Resources
				</h1>
				<p className="max-w-2xl font-thin text-foreground/75 text-xl md:text-2xl">
					Everything you need to build faster and better.
					<br />
					For Developers, By Developers.
				</p>
				<Suspense fallback={<CategoriesRowSkeleton />}>
					<CategoriesRow />
				</Suspense>
			</div>
			<div className="container mx-auto px-4 py-24">
				<Suspense fallback={<ResourceGridSkeleton />}>
					<ResourcesGrid />
				</Suspense>
			</div>
		</main>
	);
}
