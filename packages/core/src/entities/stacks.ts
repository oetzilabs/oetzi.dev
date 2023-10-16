import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { StackSelect, stacks, users } from "../drizzle/sql/schema";

export * as Stack from "./stacks";

export const create = z.function(z.tuple([createInsertSchema(stacks)])).implement(async (input) => {
  const [x] = await db.insert(stacks).values(input).returning();
  return {
    ...x,
  };
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${stacks.id})`,
    })
    .from(stacks);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.stacks.findFirst({
    where: (stacks, operations) => operations.eq(stacks.id, input),
    with: {},
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.stacks.findMany({
    with: {},
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(stacks)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    let [u] = await db
      .update(stacks)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(stacks.id, input.id))
      .returning();
    return u;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export type Frontend = Awaited<ReturnType<typeof findById>>;

export type Stack = StackSelect;
