import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { stackUsedByUsers } from "./stackUsedByUsers";
import { projects } from "./project";
import { stackUsedByTechnologies } from "./stackUsedByTechnologies";

export const stacks = sqliteTable("stacks", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  protected: text("protected", { mode: "text" })
    .notNull()
    .$defaultFn(() => ""),
});

export type StackSelect = typeof stacks.$inferSelect;
export type StackInsert = typeof stacks.$inferInsert;

export const stacksRelation = relations(stacks, ({ one, many }) => ({
  usedByUsers: many(stackUsedByUsers),
  usedByProjects: many(projects),
  usedByTechnologies: many(stackUsedByTechnologies),
}));
