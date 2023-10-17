import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { stacks } from "./stacks";
import { technologies } from "./technologies";

export const stackUsedByTechnologies = sqliteTable("stack_used_by_technologies", {
  ...Entity.defaults,
  technologyId: text("technology_id")
    .notNull()
    .references(() => technologies.id, { onDelete: "cascade" }),
  stackId: text("stack_id")
    .notNull()
    .references(() => stacks.id, { onDelete: "cascade" }),
});

export type StackUsedByTechnologySelect = typeof stackUsedByTechnologies.$inferSelect;
export type StackUsedByTechnologyInsert = typeof stackUsedByTechnologies.$inferInsert;

export const stackUsedByTechnologiesRelation = relations(stackUsedByTechnologies, ({ one }) => ({
  technology: one(technologies, {
    fields: [stackUsedByTechnologies.technologyId],
    references: [technologies.id],
  }),
  stack: one(stacks, {
    fields: [stackUsedByTechnologies.stackId],
    references: [stacks.id],
  }),
}));
