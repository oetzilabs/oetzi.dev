import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { TechnologySelect, technologies, users } from "../drizzle/sql/schema";

export * as Technology from "./technologies";

export const create = z.function(z.tuple([createInsertSchema(technologies)])).implement(async (input) => {
  const [x] = await db.insert(technologies).values(input).returning();
  return {
    ...x,
  };
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${technologies.id})`,
    })
    .from(technologies);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.technologies.findFirst({
    where: (technologies, operations) => operations.eq(technologies.id, input),
    with: {
      stacks: {
        with: {
          stack: true,
          technology: true,
        },
      },
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.technologies.findMany({
    with: {
      stacks: {
        with: {
          stack: true,
          technology: true,
        },
      },
    },
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(technologies)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    let [u] = await db
      .update(technologies)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(technologies.id, input.id))
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

export type Technology = TechnologySelect;
