import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProjectSelect, projects } from "../drizzle/sql/schema";
import { Octokit } from "@octokit/rest";
import { User } from "./users";
import { organizations } from "../../../app/src/utils/api/queries";

export * as Project from "./projects";

export const CreateProjectZod = createInsertSchema(projects)
  .omit({
    ownerId: true,
    deletedAt: true,
    id: true,
    remote: true,
    createdAt: true,
    updatedAt: true,
    syncedAt: true,
  })
  .extend({
    org: z.string(),
  });

export type CreateProjectInput = z.infer<typeof CreateProjectZod>;

export const create = z
  .function(z.tuple([z.string().uuid(), CreateProjectZod]))
  .implement(async (userId, projectInput) => {
    const freshAccessToken = await User.getFreshAccessToken(userId);
    const octo = new Octokit({
      auth: `bearer ${freshAccessToken}`,
    });
    // create repo on organization
    const repo = await octo.repos.createInOrg({
      name: projectInput.name,
      org: projectInput.org,
      private: projectInput.visibility === "private",
      description: projectInput.description ?? "",
    });

    const [x] = await db
      .insert(projects)
      .values({
        ...projectInput,
        name: `${projectInput.org}/${repo.data.name}`,
        description: repo.data.description,
        visibility: repo.data.private ? "private" : "public",
        ownerId: userId,
        createdAt: new Date(),
        deletedAt: null,
        remote: repo.data.url,
      })
      .returning();
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

export const parse = CreateProjectZod.parse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Project = ProjectSelect;
