import { sqliteTable, text, blob, integer } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { techUsedByProjects } from "./techUsedByProjects";

export const projects = sqliteTable("projects", {
  ...Entity.defaults,
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  visibility: text("visibility", { enum: ["public", "private"] })
    .notNull()
    .$defaultFn(() => "public"),
  remote: text("remote"),
});

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;

export const projectRelation = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  techsByProject: many(techUsedByProjects),
}));
