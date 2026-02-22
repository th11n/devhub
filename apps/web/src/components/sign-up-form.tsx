import { Button } from "@devhub/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@devhub/ui/components/input-group";
import { Label } from "@devhub/ui/components/label";
import { Spinner } from "@devhub/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import SocialAuthButtons from "./social-auth-buttons";

export default function SignUpForm({
	onSwitchToSignIn,
	onSuccess,
}: {
	onSwitchToSignIn: () => void;
	onSuccess?: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						router.push("/dashboard");
						sileo.success({ title: "Sign up successful" });
						onSuccess?.();
					},
					onError: (error) => {
						sileo.error({
							title: error.error.message || error.error.statusText,
						});
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

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
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Name</Label>
								<InputGroup>
									<InputGroupAddon>
										<User className="size-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										name={field.name}
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
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<InputGroup>
									<InputGroupAddon>
										<Mail className="size-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										name={field.name}
										type="email"
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
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Password</Label>
								<InputGroup>
									<InputGroupAddon>
										<Lock className="size-4" />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										name={field.name}
										type="password"
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
									Sign Up...
								</>
							) : (
								"Sign Up"
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<SocialAuthButtons />

			<div className="mt-4 text-center">
				<button
					type="button"
					onClick={onSwitchToSignIn}
					className="font-medium text-primary text-sm hover:underline"
				>
					Already have an account? Sign In
				</button>
			</div>
		</div>
	);
}
