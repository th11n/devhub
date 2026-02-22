"use client";

import { Button } from "@devhub/ui/components/button";
import { Spinner } from "@devhub/ui/components/spinner";
import { Heart } from "lucide-react";
import { useState } from "react";
import { sileo } from "sileo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import AuthModal from "./auth-modal";

interface FavoriteButtonProps {
	resourceId: string;
	className?: string;
	initialIsFavorited?: boolean;
}

export default function FavoriteButton({
	resourceId,
	className,
	initialIsFavorited = false,
}: FavoriteButtonProps) {
	const { data: session } = authClient.useSession();
	const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const toggleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!session) {
			setShowAuthModal(true);
			return;
		}

		setIsLoading(true);
		const newState = !isFavorited;

		const promise = fetch("http://localhost:3000/api/like", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userId: session.user.id,
				resourceId: resourceId,
			}),
		})
			.then(async (res) => {
				if (!res.ok) {
					const error = await res.json();
					throw new Error(error.error || "Failed to update favorite");
				}
				return res.json();
			})
			.finally(() => {
				setIsLoading(false);
			});

		sileo.promise(promise, {
			loading: {
				title: newState
					? "Adding to favorites..."
					: "Removing from favorites...",
			},
			success: () => {
				setIsFavorited(newState);
				return {
					title: newState ? "Added to favorites" : "Removed from favorites",
					description: newState
						? "You can find it in your favorites page."
						: undefined,
				};
			},
			error: (err: any) => ({
				title: "Error",
				description: err.message || "Something went wrong.",
			}),
		});
	};

	return (
		<>
			<AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
			<Button
				variant="ghost"
				size="icon"
				disabled={isLoading}
				onClick={toggleFavorite}
				className={cn(
					"group/heart size-8 rounded-full bg-background/50 backdrop-blur-md transition-all",
					isFavorited
						? "text-red-500 opacity-100"
						: "text-foreground opacity-60 hover:opacity-100",
					isLoading && "opacity-100",
					className,
				)}
			>
				{isLoading ? (
					<Spinner className="size-3 text-red-500" />
				) : (
					<Heart
						className={cn(
							"size-4 transition-transform active:scale-125 group-hover/heart:stroke-red-500",
							isFavorited && "fill-red-500 stroke-red-500",
						)}
					/>
				)}
				<span className="sr-only">Favorite</span>
			</Button>
		</>
	);
}
