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
						className="hidden px-6 sm:inline-flex"
					>
						Submit
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
