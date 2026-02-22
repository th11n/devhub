import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const likes = pgTable(
	"likes",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").notNull(),
		resourceId: text("resource_id").notNull(),
		likedAt: timestamp("liked_at").defaultNow().notNull(),
	},
	(table) => [index("likes_userId_idx").on(table.userId)],
);
