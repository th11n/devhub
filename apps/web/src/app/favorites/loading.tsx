import { ResourceGridSkeleton } from "@/components/skeletons";

export default function Loading() {
	return (
		<main className="container mx-auto px-4 py-32">
			<div className="mb-16 flex flex-col gap-12 px-4">
				<div className="space-y-4">
					<div className="h-16 w-64 animate-pulse rounded-2xl bg-accent md:h-24" />
					<div className="h-6 w-96 animate-pulse rounded-lg bg-accent" />
				</div>
			</div>
			<div className="px-4">
				<ResourceGridSkeleton count={6} />
			</div>
		</main>
	);
}
