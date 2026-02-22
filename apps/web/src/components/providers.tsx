"use client";

import { Toaster } from "sileo";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			{children}
			<Toaster
				position="bottom-right"
				options={{
					fill: "var(--secondary)",
					roundness: 16,
					styles: {
						title: "text-foreground!",
						description: "text-muted-foreground!",
						badge: "bg-secondary-foreground",
						button: "bg-secondary-foreground hover:bg-secondary-foreground/80",
					},
				}}
			/>
		</ThemeProvider>
	);
}
