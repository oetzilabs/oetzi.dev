import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const sessions = sqliteTable("sessions", {
  ...Entity.defaults,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
  expires_at: integer("expires_at", { mode: "timestamp" }).$type<Date>(),
  expires_in: integer("expires_in", { mode: "timestamp" }).$type<Date>(),
});

export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;

export const sessionRelation = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
