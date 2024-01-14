import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";

export const blogs = sqliteTable("blogs", {
  ...Entity.defaults,
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  visibility: text("visibility", { enum: ["public", "private"] })
    .notNull()
    .$defaultFn(() => "public"),
});

export type BlogSelect = typeof blogs.$inferSelect;
export type BlogInsert = typeof blogs.$inferInsert;

export const blogRelation = relations(blogs, ({ one }) => ({
  user: one(users, {
    fields: [blogs.ownerId],
    references: [users.id],
  }),
}));
