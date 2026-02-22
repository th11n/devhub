import { defineField, defineType } from "sanity";

export const likesType = defineType({
	name: "likes",
	title: "Likes",
	type: "document",
	fields: [
		defineField({
			name: "userId",
			title: "User ID",
			type: "string",
			validation: (rule) => rule.required().min(2).max(60),
		}),
		defineField({
			name: "resourceId",
			title: "Resource ID",
			type: "string",
			validation: (rule) => rule.required().min(2).max(60),
		}),
		defineField({
			name: "likedAt",
			title: "Liked At",
			type: "datetime",
			validation: (rule) => rule.required(),
		}),
	],
});
