import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "@devhub/ui/globals.css";
import Header from "@/components/navbar";
import Providers from "@/components/providers";
import { fetchWithCache } from "@/lib/cache";
import { CATEGORIES_QUERY } from "@/lib/sanity-queries";

const grotesk = Space_Grotesk({
	variable: "--font-grotesk",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "devhub",
	description: "devhub",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const categories = await fetchWithCache<any[]>(CATEGORIES_QUERY, {});

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${grotesk.variable} ${geistMono.variable} antialiased`}>
				<Providers>
					<div className="grid h-svh grid-rows-[auto_1fr]">
						<Header categories={categories} />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
