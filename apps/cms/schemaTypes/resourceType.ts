import { defineField, defineType } from "sanity";

export const resourceCategoryType = defineType({
	name: "resourceCategory",
	title: "Resource Category",
	type: "document",
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			validation: (rule) => rule.required().min(2).max(60),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: { source: "name" },
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 3,
		}),
	],
	preview: {
		select: {
			title: "name",
			subtitle: "description",
		},
	},
});

export const resourceType = defineType({
	name: "resource",
	title: "Resource",
	type: "document",
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			validation: (rule) => rule.required().min(2).max(120),
		}),

		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: { source: "name" },
			validation: (rule) => rule.required(),
		}),

		defineField({
			name: "status",
			title: "Status",
			type: "string",
			initialValue: "review",
			options: {
				list: [
					{ title: "Draft", value: "draft" },
					{ title: "In Review", value: "review" },
					{ title: "Public", value: "public" },
					{ title: "Archived", value: "archived" },
				],
				layout: "dropdown",
			},
			validation: (rule) => rule.required(),
		}),

		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 4,
			validation: (rule) => rule.required().min(20).max(600),
		}),

		defineField({
			name: "link",
			title: "Link",
			type: "url",
			validation: (rule) =>
				rule.required().uri({
					scheme: ["http", "https"],
					allowRelative: false,
				}),
		}),

		defineField({
			name: "logo",
			title: "Logo",
			type: "image",
			options: { hotspot: true },
		}),

		defineField({
			name: "previewImage",
			title: "Landing / Preview Image",
			type: "image",
			options: { hotspot: true },
		}),

		defineField({
			name: "categories",
			title: "Categories",
			type: "array",
			of: [
				{
					type: "reference",
					to: [{ type: "resourceCategory" }],
				},
			],
			validation: (rule) => rule.min(1),
		}),

		defineField({
			name: "publishedAt",
			title: "Published at",
			type: "datetime",
		}),
	],

	preview: {
		select: {
			title: "name",
			subtitle: "link",
			media: "logo",
			status: "status",
		},
		prepare({ title, subtitle, media, status }) {
			const badge =
				status === "public"
					? "✅ public"
					: status === "review"
						? "🟡 review"
						: status === "draft"
							? "⚪ draft"
							: "🗄️ archived";

			return {
				title: title || "(no name)",
				subtitle: `${badge} • ${subtitle || ""}`,
				media,
			};
		},
	},
});
