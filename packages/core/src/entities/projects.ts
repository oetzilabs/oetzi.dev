import { eq, isNotNull, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProjectSelect, projects, techUsedByProjects, techs } from "../drizzle/sql/schema";

export * as Project from "./projects";

export const CreateProjectZod = createInsertSchema(projects).omit({
  ownerId: true,
});

export type CreateProjectInput = z.infer<typeof CreateProjectZod>;

export const create = z
  .function(z.tuple([z.string().uuid(), CreateProjectZod]))
  .implement(async (userId, projectInput) => {
    const [x] = await db
      .insert(projects)
      .values({
        ...projectInput,
        ownerId: userId,
      })
      .returning();
    return x;
  });

export const remove = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (userId, projectId) => {
    const project = await db.query.projects.findFirst({
      where: (projects, operations) => operations.eq(projects.id, projectId),
    });
    if (!project) throw new Error("Project not found");

    const [x] = await db.delete(projects).where(eq(projects.id, projectId)).returning();
    return x;
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
      techsByProject: {
        with: {
          tech: true,
        },
      },
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.projects.findMany({
    with: {
      user: true,
      techsByProject: {
        with: {
          tech: true,
        },
      },
    },
    orderBy(fields, order) {
      return [order.desc(fields.updatedAt), order.desc(fields.createdAt)];
    },
  });
});

export const AllWithFilterZod = z.object({
  visibility: z
    .union([z.literal("public"), z.literal("private")])
    .default("public")
    .optional(),
  deleted: z
    .boolean()
    .or(z.string().transform((v) => (v === "true" ? true : false)))
    .optional(),
});

export const allWithFilter = z.function(z.tuple([AllWithFilterZod.optional()])).implement(async (filter) => {
  return db.query.projects.findMany({
    where: (projects, operations) =>
      operations.and(
        operations.eq(projects.deletedAt, filter?.deleted ? isNotNull(projects.deletedAt) : isNull(projects.deletedAt)),
        operations.eq(projects.visibility, filter?.visibility ?? "public")
      ),
    with: {
      user: true,
      techsByProject: {
        with: {
          tech: true,
        },
      },
    },
    orderBy(fields, order) {
      return [order.desc(fields.updatedAt), order.desc(fields.createdAt)];
    },
  });
});

export const allByUser = z
  .function(
    z.tuple([
      z.string().uuid(),
      z
        .object({
          search: z.string().optional(),
        })
        .optional(),
    ])
  )
  .implement(async (input, options) => {
    let u = await db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, input),
      with: {
        projects: {
          with: {
            user: true,
          },
          where: (projects, operations) =>
            operations.and(
              operations.eq(projects.deletedAt, isNull(projects.deletedAt)),
              typeof options !== "undefined" && typeof options.search !== "undefined"
                ? operations.or(
                    operations.like(projects.name, `%${options.search}%`),
                    operations.like(projects.description, `%${options.search}%`)
                  )
                : undefined
            ),
          orderBy(fields, order) {
            return [order.desc(fields.updatedAt), order.desc(fields.createdAt)];
          },
        },
      },
    });
    if (!u) return [];
    return u.projects;
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

export const addTech = z
  .function(
    z.tuple([
      z.object({
        id: z.string().uuid(),
        tech: z.object({
          name: z.string(),
          description: z.string().optional(),
        }),
      }),
    ])
  )
  .implement(async (input) => {
    const p = await db.query.projects.findFirst({
      where: (projects, operations) => operations.eq(projects.id, input.id),
    });
    if (!p) throw new Error("Project not found");
    const x = await db.query.techs.findFirst({
      where: (techs, operations) => operations.eq(techs.name, input.tech.name),
    });
    if (!x) {
      const [t] = await db
        .insert(techs)
        .values({
          ...input.tech,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      const [y] = await db
        .insert(techUsedByProjects)
        .values({
          project_id: input.id,
          tech_id: t.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    } else {
      // check if the connection is already there, if not create it
      const y = await db.query.techUsedByProjects.findFirst({
        where: (techUsedByProjects, operations) =>
          operations.and(
            operations.eq(techUsedByProjects.project_id, input.id),
            operations.eq(techUsedByProjects.tech_id, x.id)
          ),
      });
      if (!y) {
        const [z] = await db
          .insert(techUsedByProjects)
          .values({
            project_id: input.id,
            tech_id: x.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
      } else {
        throw new Error("Tech already connected to project");
      }
      throw new Error("Tech already exists, please use the existing one");
    }
  });

export const removeTech = z
  .function(z.tuple([z.object({ id: z.string().uuid(), techId: z.string().uuid() })]))
  .implement(async (input) => {
    const p = await db.query.projects.findFirst({
      where: (projects, operations) => operations.eq(projects.id, input.id),
    });
    if (!p) throw new Error("Project not found");
    const x = await db.query.techs.findFirst({
      where: (techs, operations) => operations.eq(techs.id, input.techId),
    });
    if (!x) throw new Error("Tech not found");
    const y = await db.query.techUsedByProjects.findFirst({
      where: (techUsedByProjects, operations) =>
        operations.and(
          operations.eq(techUsedByProjects.project_id, input.id),
          operations.eq(techUsedByProjects.tech_id, input.techId)
        ),
    });
    if (!y) throw new Error("Tech not connected to project");
    const [z] = await db.delete(techUsedByProjects).where(eq(techUsedByProjects.id, y.id)).returning();
    return z;
  });

export const parse = CreateProjectZod.parse;
export const safeParse = CreateProjectZod.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Project = ProjectSelect;
