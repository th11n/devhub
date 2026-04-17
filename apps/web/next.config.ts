import "@devhub/env/web";
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	output: "standalone",
	typedRoutes: true,
	reactCompiler: true,
	transpilePackages: ["@devhub/ui"],
	turbopack: {
		root: path.join(__dirname),
	},
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
