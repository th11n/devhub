"use client";

import { Button } from "@devhub/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@devhub/ui/components/dialog";
import { useEffect, useState } from "react";
import { cacheCategories } from "@/lib/submission-queue";
import SubmitResourceForm from "./submit-resource-form";

interface Category {
	_id: string;
	name: string;
}

export default function SubmitResourceModal({
	trigger,
	categories,
}: {
	trigger?: React.ReactNode;
	categories: Category[];
}) {
	const [open, setOpen] = useState(false);
	const [isStandalonePwa, setIsStandalonePwa] = useState(false);

	useEffect(() => {
		const standalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
		setIsStandalonePwa(standalone);
	}, []);

	useEffect(() => {
		if (isStandalonePwa) void cacheCategories(categories);
	}, [categories, isStandalonePwa]);

	const title = isStandalonePwa ? "Quick Add" : "Submit Resource";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant="default"
						size="sm"
						className="inline-flex px-3 sm:w-24 sm:px-6"
						aria-label={title}
					>
						<span className="hidden sm:inline">
							{isStandalonePwa ? "Quick Add" : "Submit"}
						</span>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-4 w-4 sm:hidden"
						>
							<title>{title}</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="font-bold text-2xl">{title}</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<SubmitResourceForm
						categories={categories}
						source={isStandalonePwa ? "pwa" : "web"}
						onSuccess={() => setOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
