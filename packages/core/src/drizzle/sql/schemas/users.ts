import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { relations } from "drizzle-orm";
import { profiles } from "./profile";
import { sessions } from "./session";
import { projects } from "./project";
import { project_participants } from "./project_participants";
import { stackUsedByUsers } from "./stackUsedByUsers";

export const users = sqliteTable("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export const userRelation = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sessions: many(sessions),
  projects: many(projects),
  stacks: many(stackUsedByUsers),
  project_participants: many(project_participants),
}));
