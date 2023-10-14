// project_participants

import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { projects } from "./project";

export const project_participants = sqliteTable("project_participants", {
  ...Entity.defaults,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
});

export type ProjectParticipantSelect = typeof project_participants.$inferSelect;
export type ProjectParticipantInsert = typeof project_participants.$inferInsert;

export const projectParticipantsRelation = relations(project_participants, ({ one }) => ({
  user: one(users, {
    fields: [project_participants.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [project_participants.projectId],
    references: [projects.id],
  }),
}));
