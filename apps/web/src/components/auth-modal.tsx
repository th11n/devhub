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
import SignInForm from "./sign-in-form";
import SignUpForm from "./sign-up-form";

interface AuthModalProps {
	trigger?: React.ReactNode;
	defaultMode?: "sign-in" | "sign-up";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function AuthModal({
	trigger,
	defaultMode = "sign-in",
	open: externalOpen,
	onOpenChange: setExternalOpen,
}: AuthModalProps) {
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen =
		setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

	const [mode, setMode] = useState<"sign-in" | "sign-up">(defaultMode);

	useEffect(() => {
		if (!open) {
			setTimeout(() => setMode(defaultMode), 300);
		}
	}, [open, defaultMode]);

	const isControlled = externalOpen !== undefined;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{(trigger || !isControlled) && (
				<DialogTrigger asChild>
					{trigger || (
						<Button variant="outline" size="sm" className="px-6">
							Sign In
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="font-bold text-2xl">
						{mode === "sign-in" ? "Welcome Back" : "Create Account"}
					</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					{mode === "sign-in" ? (
						<SignInForm
							onSwitchToSignUp={() => setMode("sign-up")}
							onSuccess={() => setOpen(false)}
						/>
					) : (
						<SignUpForm
							onSwitchToSignIn={() => setMode("sign-in")}
							onSuccess={() => setOpen(false)}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
