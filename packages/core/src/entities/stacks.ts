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
    with: {
      usedByTechnologies: {
        with: { technology: true },
      },
    },
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

export const StackZod = z.object({
  technologies: z.array(
    z.object({
      name: z.union([
        z.literal("db:pg"),
        z.literal("db:sqlite"),
        z.literal("db:turso"),
        z.literal("db:mysql"),
        z.literal("db:mssql"),
        z.literal("db:redis"),
        z.literal("db:mongo"),
        z.literal("auth:sst"),
        z.literal("api"),
        z.literal("storage"),
        z.literal("queue"),
      ]),
      version: z.string(),
    })
  ),
});

const StackTechnologiesValidation = z.function(z.tuple([StackZod])).implement(async (input) =>
  db.query.technologies.findMany({
    where: (fields, operations) =>
      operations.inArray(
        fields.name,
        input.technologies.map((t) => t.name)
      ),
  })
);

export type StackToml = z.infer<typeof StackZod>;

export const isValid = z.function(z.tuple([z.string()])).implement(async (input) => {
  const toml = (await import("toml")).parse;
  let result: StackToml | undefined = undefined;
  result = toml(input);
  const stack = StackZod.safeParse(result);
  if (!stack.success) {
    throw new Error(stack.error.message);
  }
  result = stack.data;
  const collection = await StackTechnologiesValidation(result);

  return collection;
});

export const calculateVersion = z.function(z.tuple([z.string(), z.boolean()])).implement(async (name, withHash) => {
  // check if the stack name exists and if so return the next version number => ex: 0.0.1:<hash?>
  const stacks = await db.query.stacks.findMany({
    where: (stacks, operations) =>
      operations.and(operations.eq(stacks.name, name), operations.eq(stacks.deletedAt, isNull(stacks.deletedAt))),
  });
  const latestStack = stacks[0];
  if (!latestStack) return "0.0.1";

  const versions = stacks.map((s) => s.version);
  const latestVersion = versions.sort().reverse()[0];
  const [major, minor, patch] = latestVersion.split(".");
  let patches = patch.split(":");
  // if the latest version has a hash, then increment the patch number, and remove the hash
  if (patches.length > 1) {
    patches = patches.slice(0, patches.length - 1);
  }

  return `${major}.${minor}.${parseInt(patches[0]) + 1}${
    withHash ? `:${Math.random().toString(36).substring(7)}` : ""
  }`;
});

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Stack = StackSelect;
