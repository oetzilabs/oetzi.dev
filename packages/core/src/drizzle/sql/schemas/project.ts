import { sqliteTable, text, blob, integer } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { project_participants } from "./project_participants";
import { stacks } from "./stacks";

export const projects = sqliteTable("projects", {
  ...Entity.defaults,
  syncedAt: integer("synced_at", { mode: "timestamp" }),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  protected: text("protected", { mode: "text" })
    .notNull()
    .$defaultFn(() => ""),
  visibility: text("visibility", { enum: ["public", "private"] })
    .notNull()
    .$defaultFn(() => "public"),
  remote: text("remote").notNull(),
  stackId: text("stack_id")
    .notNull()
    .references(() => stacks.id),
});

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;

export const projectRelation = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  participants: many(project_participants),
  stack: one(stacks, {
    fields: [projects.stackId],
    references: [stacks.id],
  }),
}));
