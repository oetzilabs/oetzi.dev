import { integer, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";

export const links = sqliteTable("links", {
  ...Entity.defaults,
  group: text("group").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  protected: text("protected")
    .notNull()
    .$defaultFn(() => ""),
  meta: blob("meta", { mode: "json" })
    .notNull()
    .$type<
      Array<{
        name: string;
        content: string;
      }>
    >()
    .$defaultFn(() => []),
});

export type LinkSelect = typeof links.$inferSelect;
export type LinkInsert = typeof links.$inferInsert;
