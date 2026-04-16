"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ResourceCard from "./resource-card";
import { loadMoreResources } from "@/app/actions";

interface InfiniteResourcesGridProps {
	initialResources: any[];
}

export default function InfiniteResourcesGrid({
	initialResources,
}: InfiniteResourcesGridProps) {
	const [resources, setResources] = useState(initialResources);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(initialResources.length >= 12);
	const observer = useRef<IntersectionObserver | null>(null);

	const lastResourceElementRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (loading) return;
			if (observer.current) observer.current.disconnect();

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					loadMore();
				}
			});

			if (node) observer.current.observe(node);
		},
		[loading, hasMore],
	);

	const loadMore = async () => {
		setLoading(true);
		try {
			const newResources = await loadMoreResources(resources.length, 12);
			if (newResources.length === 0) {
				setHasMore(false);
			} else {
				setResources((prev) => {
					// Filter out duplicates just in case
					const existingIds = new Set(prev.map((r) => r._id));
					const uniqueNew = newResources.filter((r) => !existingIds.has(r._id));
					return [...prev, ...uniqueNew];
				});
				if (newResources.length < 12) {
					setHasMore(false);
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{resources.map((resource, index) => {
					if (resources.length === index + 1) {
						return (
							<div ref={lastResourceElementRef} key={resource._id}>
								<ResourceCard
									resource={resource}
									isFavorited={resource.isFavorited}
								/>
							</div>
						);
					} else {
						return (
							<ResourceCard
								key={resource._id + "-" + index}
								resource={resource}
								isFavorited={resource.isFavorited}
							/>
						);
					}
				})}
			</div>
			{loading && (
				<div className="mt-12 flex justify-center pb-8">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			)}
		</>
	);
}
