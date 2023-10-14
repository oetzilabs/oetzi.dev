import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProjectSelect, projects } from "../drizzle/sql/schema";

export * as Project from "./projects";

export const create = z.function(z.tuple([createInsertSchema(projects)])).implement(async (projectInput) => {
  const [x] = await db.insert(projects).values(projectInput).returning();
  return {
    ...x,
  };
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${projects.id})`,
    })
    .from(projects);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.projects.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {
      user: true,
      participants: true,
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.projects.findMany({
    with: {
      user: true,
      participants: true,
    },
  });
});

export const allByUser = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  let u = await db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {
      projects: true,
      project_participants: {
        with: {
          project: true,
        },
      },
    },
  });
  if (!u) return [];
  return u.projects.concat(u.project_participants.map((x) => x.project));
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(projects)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    let [p] = await db
      .update(projects)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(projects.id, input.id))
      .returning();
    return p;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export const parse = createInsertSchema(projects).parse;

export type Frontend = Awaited<ReturnType<typeof findById>>;

export type Project = ProjectSelect;
