"use client";

import { Button } from "@devhub/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@devhub/ui/components/input-group";
import { Label } from "@devhub/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@devhub/ui/components/select";
import { Spinner } from "@devhub/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { Link as LinkIcon, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import z from "zod";

interface Category {
	_id: string;
	name: string;
}

export default function SubmitResourceForm({
	categories,
	onSuccess,
}: {
	categories: Category[];
	onSuccess?: () => void;
}) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			url: "",
			categoryId: categories[0]?._id || "",
		},
		onSubmit: async ({ value }) => {
			const promise = fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/submit`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(value),
			}).then(async (res) => {
				if (!res.ok) {
					const error = await res.json();
					throw new Error(error.message || "Failed to submit resource");
				}
				return res.json();
			});

			sileo.promise(promise, {
				loading: { title: "Submitting and enriching resource..." },
				success: () => {
					onSuccess?.();
					router.refresh();
					return {
						title: "Resource submitted successfully!",
						description: "It will be reviewed soon.",
					};
				},
				error: (err: any) => ({
					title: "Failed to submit resource",
					description: err.message || "Something went wrong.",
				}),
			});
		},
		validators: {
			onSubmit: z.object({
				url: z.url("Please enter a valid URL"),
				categoryId: z.string().min(1, "Please select a category"),
			}),
		},
	});

	return (
		<div className="w-full">
			<form
				onSubmit={(e: React.FormEvent) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div>
					<form.Field name="url">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Resource URL</Label>
								<InputGroup>
									<InputGroupAddon>
										<LinkIcon className="size-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										name={field.name}
										type="url"
										placeholder="https://example.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											field.handleChange(e.target.value)
										}
									/>
								</InputGroup>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="categoryId">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Category</Label>
								<div className="relative">
									<InputGroup className="relative">
										<InputGroupAddon>
											<Tag className="size-4" />
										</InputGroupAddon>
										<Select
											value={field.state.value}
											onValueChange={(val: string) => field.handleChange(val)}
										>
											<SelectTrigger className="h-9 flex-1 border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												{categories.map((category) => (
													<SelectItem key={category._id} value={category._id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</InputGroup>
								</div>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="mt-6 w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? (
								<>
									<Spinner className="mr-2" />
									Submitting...
								</>
							) : (
								"Submit Resource"
							)}
						</Button>
					)}
				</form.Subscribe>
				<p className="text-center text-muted-foreground text-xs">
					Your resource will be reviewed by our team before it appears on the
					website.
				</p>
			</form>
		</div>
	);
}
