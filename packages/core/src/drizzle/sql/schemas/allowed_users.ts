import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";

export const allowed_users = sqliteTable("allowed_users", {
  ...Entity.defaults,
  email: text("email").notNull(),
});

export type AllowedUserSelect = typeof allowed_users.$inferSelect;
export type AllowedUserInsert = typeof allowed_users.$inferInsert;
