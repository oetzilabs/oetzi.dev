import { eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import {
  StackSelect,
  stackUsedByTechnologies,
  stackUsedByUsers,
  stacks,
  technologies,
  users,
} from "../drizzle/sql/schema";

export * as Stack from "./stacks";

export const create = z
  .function(
    z.tuple([z.string().uuid(), createInsertSchema(stacks).extend({ technologies: z.array(z.string().uuid()) })])
  )
  .implement(async (userId, input) => {
    const { technologies, ...stack } = input;
    const [x] = await db.insert(stacks).values(stack).returning();
    const [y] = await db.insert(stackUsedByUsers).values({ stackId: x.id, userId }).returning();
    const techs = await db
      .insert(stackUsedByTechnologies)
      .values(technologies.map((t) => ({ stackId: x.id, technologyId: t })))
      .returning();
    const theStack = await db.query.stacks.findFirst({
      where: (stacks, operations) => operations.eq(stacks.id, x.id),
      with: {
        usedByTechnologies: {
          with: {
            technology: true,
          },
        },
        usedByUsers: {
          with: {
            user: true,
          },
        },
        usedByProjects: {
          where(fields, operators) {
            return operators.and(
              operators.eq(fields.deletedAt, isNull(fields.deletedAt)),
              operators.eq(fields.visibility, "public")
            );
          },
        },
      },
    });

    return theStack;
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

export const isValid = z.function(z.tuple([z.string()])).implement(async (input) => {
  const toml = (await import("toml")).parse;
  let result: any = {};
  result = toml(input);
  // TODO: validate the stack via zod
  return result;
});

export type Frontend = Awaited<ReturnType<typeof findById>>;

export type Stack = StackSelect;
