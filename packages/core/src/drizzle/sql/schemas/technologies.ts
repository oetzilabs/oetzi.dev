import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { stackUsedByTechnologies } from "./stackUsedByTechnologies";

export const technologies = sqliteTable("technologies", {
  ...Entity.defaults,
  name: text("name").notNull(),
  template: text("template").notNull(),
  description: text("description"),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  protected: text("protected", { mode: "text" })
    .notNull()
    .$defaultFn(() => ""),
});

export type TechnologySelect = typeof technologies.$inferSelect;
export type TechnologyInsert = typeof technologies.$inferInsert;

export const technologiesRelation = relations(technologies, ({ many }) => ({
  stacks: many(stackUsedByTechnologies),
}));
