import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { techs, users } from "../drizzle/sql/schema";

export * as Technology from "./technologies";

export const create = z.function(z.tuple([createInsertSchema(techs)])).implement(async (input) => {
  const [x] = await db.insert(techs).values(input).returning();
  return {
    ...x,
  };
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${techs.id})`,
    })
    .from(techs);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.techs.findFirst({
    where: (techs, operations) => operations.eq(techs.id, input),
    with: {
      usedByProjects: {
        with: {
          project: true,
        },
      },
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.techs.findMany({
    with: {
      usedByProjects: {
        with: {
          project: true,
        },
      },
    },
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(techs)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    let [u] = await db
      .update(techs)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(techs.id, input.id))
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

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Technology = typeof techs.$inferSelect;
