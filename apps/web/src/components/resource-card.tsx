import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@devhub/ui/components/card";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity-client";
import FavoriteButton from "./favorite-button";

interface ResourceCardProps {
	resource: {
		_id: string;
		name: string;
		link: string;
		description?: string;
		previewImage?: any;
		logo?: any;
		categories?: { name: string }[];
	};
	isFavorited?: boolean;
}

export default function ResourceCard({
	resource,
	isFavorited = false,
}: ResourceCardProps) {
	return (
		<div className="group relative">
			<FavoriteButton
				resourceId={resource._id}
				initialIsFavorited={isFavorited}
				className="absolute top-4 right-4 z-20"
			/>
			<Link
				href={resource.link as any}
				rel="noopener noreferrer"
				target="_blank"
				className="transition-transform"
			>
				<Card className="h-full overflow-hidden rounded-sm border border-border/50 bg-card/50 backdrop-blur-sm transition-colors group-hover:border-primary/50 group-hover:bg-card">
					<CardHeader className="p-0">
						<div className="relative aspect-video w-full overflow-hidden border-border/30 border-b bg-muted">
							{resource.previewImage ? (
								<Image
									src={urlFor(resource.previewImage)
										.width(600)
										.height(337)
										.url()}
									alt={resource.name}
									fill
									className="object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							) : (
								<div className="absolute inset-0 flex select-none items-center justify-center font-bold text-4xl text-muted-foreground/20">
									{resource.name.substring(0, 1)}
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 px-5 py-6">
						<div className="flex items-center justify-between gap-3">
							<div className="flex flex-wrap gap-2">
								{resource.categories?.map((cat: any) => (
									<span
										key={cat.name}
										className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-[10px] text-primary uppercase tracking-wider"
									>
										{cat.name}
									</span>
								))}
							</div>
						</div>
						<div className="space-y-1">
							<CardTitle className="flex min-w-0 items-center gap-2 text-xl transition-colors group-hover:text-primary">
								{resource.logo && (
									<Image
										src={urlFor(resource.logo).width(64).height(64).url()}
										alt={`${resource.name} logo`}
										width={20}
										height={20}
										className="shrink-0 rounded-xs object-contain ring-1 ring-black/10 ring-inset dark:ring-white/15"
									/>
								)}
								<span className="truncate">{resource.name}</span>
							</CardTitle>
							<CardDescription className="line-clamp-2 min-h-[40px] text-muted-foreground/80 text-sm leading-relaxed">
								{resource.description ||
									"No description available for this curated developer resource."}
							</CardDescription>
						</div>
					</CardContent>
				</Card>
			</Link>
		</div>
	);
}
