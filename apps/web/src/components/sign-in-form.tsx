import { Button } from "@devhub/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@devhub/ui/components/input-group";
import { Label } from "@devhub/ui/components/label";
import { Spinner } from "@devhub/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import SocialAuthButtons from "./social-auth-buttons";

export default function SignInForm({
	onSwitchToSignUp,
	onSuccess,
}: {
	onSwitchToSignUp: () => void;
	onSuccess?: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						router.push("/dashboard");
						sileo.success({ title: "Sign in successful" });
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
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? (
								<>
									<Spinner className="mr-2" />
									Sign In...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<SocialAuthButtons />

			<div className="mt-4 text-center">
				<p className="text-muted-foreground text-sm">
					Don&apos;t have an account?{" "}
					<button
						type="button"
						onClick={onSwitchToSignUp}
						className="font-medium text-primary hover:underline"
					>
						Sign up
					</button>
				</p>
			</div>
		</div>
	);
}
