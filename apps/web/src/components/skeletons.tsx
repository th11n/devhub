import { Skeleton } from "@devhub/ui/components/skeleton";

export function ResourceCardSkeleton() {
	return (
		<div className="fade-in animate-in overflow-hidden rounded-sm border border-border/50 bg-card/5 duration-500">
			<Skeleton className="aspect-video w-full rounded-none" />
			<div className="space-y-4 p-6">
				<div className="flex gap-2">
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<Skeleton className="h-6 w-6 shrink-0 rounded-md" />
						<Skeleton className="h-7 w-3/4 rounded-md" />
					</div>
					<Skeleton className="h-4 w-full rounded-md" />
					<Skeleton className="h-4 w-5/6 rounded-md" />
				</div>
			</div>
		</div>
	);
}

export function ResourceGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: count }).map((_, i) => (
				<ResourceCardSkeleton key={i} />
			))}
		</div>
	);
}

export function CategorySkeleton() {
	return <Skeleton className="h-8 w-24 rounded-full" />;
}

export function CategoriesRowSkeleton() {
	return (
		<div className="mt-12 inline-flex flex-wrap gap-4">
			{Array.from({ length: 5 }).map((_, i) => (
				<CategorySkeleton key={i} />
			))}
		</div>
	);
}
