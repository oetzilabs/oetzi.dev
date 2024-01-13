import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { techs } from "./tech";
import { projects } from "./project";

export const techUsedByProjects = sqliteTable("stack_used_by_projects", {
  ...Entity.defaults,
  project_id: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  tech_id: text("tech_id")
    .notNull()
    .references(() => techs.id, { onDelete: "cascade" }),
});

export const techUsedByProjectsRelation = relations(techUsedByProjects, ({ one }) => ({
  project: one(projects, {
    fields: [techUsedByProjects.project_id],
    references: [projects.id],
  }),
  tech: one(techs, {
    fields: [techUsedByProjects.tech_id],
    references: [techs.id],
  }),
}));
