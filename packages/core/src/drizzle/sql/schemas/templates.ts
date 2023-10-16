import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const templates = sqliteTable("templates", {
  ...Entity.defaults,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  s3Key: text("s3_key"),
  description: text("description"),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  protected: text("protected", { mode: "text" })
    .notNull()
    .$defaultFn(() => ""),
});

export type TemplateSelect = typeof templates.$inferSelect;
export type TemplateInsert = typeof templates.$inferInsert;

export const templatesRelation = relations(templates, ({ one }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
}));
