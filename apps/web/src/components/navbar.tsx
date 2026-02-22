"use client";

import { Button } from "@devhub/ui/components/button";
import { Input } from "@devhub/ui/components/input";
import { Separator } from "@devhub/ui/components/separator";
import Image from "next/image";
import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { AnimatedThemeToggler } from "./mode-toggle";
import SubmitResourceModal from "./submit-resource-modal";
import UserMenu from "./user-menu";

function SearchInput() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [query, setQuery] = React.useState(searchParams.get("q") || "");

	React.useEffect(() => {
		setQuery(searchParams.get("q") || "");
	}, [searchParams]);

	const handleSearch = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			const trimmedQuery = query.trim();
			const isCategoryPage =
				pathname !== "/" &&
				pathname !== "/favorites" &&
				pathname !== "/search" &&
				pathname !== "/dashboard";

			if (trimmedQuery) {
				const basePath = isCategoryPage ? pathname : "/search";
				router.push(`${basePath}?q=${encodeURIComponent(trimmedQuery)}` as any);
			} else {
				if (isCategoryPage || pathname === "/search") {
					router.push(pathname as any);
				}
			}
		}
	};

	return (
		<div className="ml-4 flex flex-1 justify-center">
			<div className="relative w-full max-w-md">
				<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
					<svg
						viewBox="0 0 24 24"
						className="h-4 w-4"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="11" cy="11" r="7" />
						<path d="M20 20l-3.5-3.5" />
					</svg>
				</span>
				<Input
					placeholder="Search…"
					className="h-9 bg-background pl-9 transition-all focus-visible:ring-primary/20"
					value={query}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setQuery(e.target.value)
					}
					onKeyDown={handleSearch}
				/>
			</div>
		</div>
	);
}

export default function Header({ categories }: { categories: any[] }) {
	return (
		<header className="sticky top-0 z-50 w-full border-border/60 border-b bg-background/80 backdrop-blur">
			<div className="mx-auto flex h-14 max-w-full items-center justify-between gap-3 px-8">
				<div className="flex min-w-0 items-center gap-3">
					<Link href="/" className="group flex items-center">
						<span className="grid h-9 w-9 place-items-center">
							<Image
								src="/logo.png"
								alt="Logo"
								className="invert-100 transition-colors dark:invert-0"
								width={32}
								height={32}
							/>
						</span>
					</Link>
					<React.Suspense
						fallback={
							<div className="ml-4 flex flex-1 justify-center">
								<div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted/50" />
							</div>
						}
					>
						<SearchInput />
					</React.Suspense>
				</div>

				<div className="flex items-center gap-3">
					<Link href="/favorites" aria-label="Favorites">
						<svg
							viewBox="0 0 24 24"
							className="mr-2 h-4 w-4 transition-colors duration-300 hover:stroke-red-500"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M12 21l-1.2-1.1C6 15.6 3 13 3 9.8 3 7.3 5 5.5 7.4 5.5c1.3 0 2.6.6 3.4 1.6.8-1 2.1-1.6 3.4-1.6C16.9 5.5 19 7.3 19 9.8c0 3.2-3 5.8-7.8 10.1L12 21z" />
						</svg>
					</Link>

					<AnimatedThemeToggler className="cursor-pointer transition-transform duration-500 hover:rotate-360" />

					<Separator orientation="vertical" className="!h-6 mx-3" />

					<SubmitResourceModal categories={categories} />

					<UserMenu />
				</div>
			</div>
		</header>
	);
}
