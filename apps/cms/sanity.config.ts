import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
	name: "default",
	title: "devhub",

	projectId: "yd2mvdij",
	dataset: "production",

	plugins: [structureTool(), visionTool()],

	schema: {
		types: schemaTypes,
	},
	server: {
		allowedHosts: ['.dominikkrakowiak.com'],
	},
	host: "0.0.0.0",
	allowedHosts: ['cms.devhub.dominikkrakowiak.com'],
	vite: {
		server: {
			allowedHosts: ['cms.devhub.dominikkrakowiak.com']
		},
		preview: {
			allowedHosts: ['cms.devhub.dominikkrakowiak.com']
		}
	}
});
