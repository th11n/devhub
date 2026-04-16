"use client";

import { Button } from "@devhub/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@devhub/ui/components/dialog";
import { useState } from "react";
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

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant="default"
						size="sm"
						className="inline-flex px-3 sm:px-6 sm:w-24"
						aria-label="Submit Resource"
					>
						<span className="hidden sm:inline">Submit</span>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-4 w-4 sm:hidden"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
						</svg>
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="font-bold text-2xl">
						Submit Resource
					</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<SubmitResourceForm
						categories={categories}
						onSuccess={() => setOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
