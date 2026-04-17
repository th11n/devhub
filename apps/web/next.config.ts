import "@devhub/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	typedRoutes: true,
	reactCompiler: true,
	transpilePackages: ["@devhub/ui"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
			},
		],
	},
};

export default nextConfig;
