import { ResourceGridSkeleton } from "@/components/skeletons";

export default function Loading() {
	return (
		<main className="flex flex-col items-center">
			<div className="flex w-full flex-col items-center justify-center gap-12 px-4 pt-48 pb-12 text-center">
				<div className="space-y-4">
					<div className="mx-auto h-16 w-64 animate-pulse rounded-2xl bg-accent md:h-24" />
					<div className="mx-auto h-6 w-96 animate-pulse rounded-lg bg-accent" />
				</div>
				<div className="mx-auto h-10 w-full max-w-lg animate-pulse rounded-full bg-accent" />
			</div>

			<section className="container mx-auto px-4 py-24">
				<ResourceGridSkeleton count={6} />
			</section>
		</main>
	);
}
