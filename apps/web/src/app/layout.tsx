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
	metadataBase: new URL("https://devhub.dominikkrakowiak.com"),
	title: {
		default: "Devhub — High Quality Curated Resources for Developers",
		template: "%s | Devhub",
	},
	description:
		"Devhub is a high-quality curated collection of developer resources. Discover the best tools, UI inspirations, animations, components, backend utilities and more — all in one place.",
	keywords: [
		"developer resources",
		"curated tools",
		"frontend resources",
		"backend tools",
		"UI inspiration",
		"web development tools",
		"animations",
		"dev tools directory",
		"programming resources",
		"software development",
	],
	authors: [{ name: "th1n" }],
	creator: "th1n",
	publisher: "th1n",
	applicationName: "Devhub",
	category: "technology",

	openGraph: {
		title: "Devhub — High Quality Curated Resources",
		description:
			"Discover high-quality curated resources for developers. Tools, UI inspirations, animations, backend utilities and more.",
		url: "https://devhub.dominikkrakowiak.com",
		siteName: "Devhub",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Devhub — High Quality Curated Resources",
			},
		],
	},

	twitter: {
		card: "summary_large_image",
		title: "Devhub — High Quality Curated Resources",
		description:
			"A curated collection of the best developer resources — tools, UI, animations and more.",
		images: ["/og-image.png"],
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},

	alternates: {
		canonical: "https://devhub.dominikkrakowiak.com",
	},
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
