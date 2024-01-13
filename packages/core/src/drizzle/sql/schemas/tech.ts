import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { techUsedByProjects } from "./techUsedByProjects";

export const techs = sqliteTable("techs", {
  ...Entity.defaults,
  name: text("name").notNull(),
  description: text("description"),
});

export const techsRelation = relations(techs, ({ one, many }) => ({
  usedByProjects: many(techUsedByProjects),
}));
