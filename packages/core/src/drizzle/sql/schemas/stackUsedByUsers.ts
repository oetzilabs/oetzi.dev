import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { stacks } from "./stacks";
import { users } from "./users";

export const stackUsedByUsers = sqliteTable("stack_used_by_users", {
  ...Entity.defaults,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stackId: text("stack_id")
    .notNull()
    .references(() => stacks.id, { onDelete: "cascade" }),
});

export type StackUsedByUserSelect = typeof stackUsedByUsers.$inferSelect;
export type StackUsedByUserInsert = typeof stackUsedByUsers.$inferInsert;

export const stackUsedByUsersRelation = relations(stackUsedByUsers, ({ one }) => ({
  user: one(users, {
    fields: [stackUsedByUsers.userId],
    references: [users.id],
  }),
  stack: one(stacks, {
    fields: [stackUsedByUsers.stackId],
    references: [stacks.id],
  }),
}));
