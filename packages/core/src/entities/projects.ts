import { eq, isNotNull, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProjectSelect, projects } from "../drizzle/sql/schema";
import { GitHub } from "../github";
import { GitHubUtils } from "../github/utils";
import { User } from "./users";
import { Link } from "./links";

export * as Project from "./projects";

export const CreateProjectZod = createInsertSchema(projects)
  .omit({
    stackId: true,
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
    const repo = await GitHub.createRepository(freshAccessToken, projectInput.org, {
      name: projectInput.name,
      private: projectInput.visibility === "private",
      description: projectInput.description ?? "",
    });

    const [x] = await db
      .insert(projects)
      .values({
        ...projectInput,
        name: `${projectInput.org}/${repo.name}`,
        description: repo.description,
        visibility: repo.private ? "private" : "public",
        ownerId: userId,
        createdAt: new Date(),
        deletedAt: null,
        remote: repo.html_url,
      })
      .returning();
    return x;
  });

export const remove = z
  .function(z.tuple([z.string().uuid(), z.string().uuid()]))
  .implement(async (userId, projectId) => {
    const freshAccessToken = await User.getFreshAccessToken(userId);
    const project = await db.query.projects.findFirst({
      where: (projects, operations) => operations.eq(projects.id, projectId),
    });
    if (!project) throw new Error("Project not found");
    const repo = await GitHub.removeRepository(freshAccessToken, project.name);
    if (!repo) throw new Error("Could not remove repository");

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
      participants: true,
      stack: {
        with: {
          usedByProjects: {
            with: { user: true, participants: true },
          },
          usedByTechnologies: {
            with: { technology: true },
          },
        },
      },
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

export const AllWithFilterZod = z.object({
  visibility: z.union([z.literal("public"), z.literal("private")]).default("public"),
  deleted: z.boolean().default(false),
});

export const allWithFilter = z.function(z.tuple([AllWithFilterZod.optional()])).implement(async (filter) => {
  return db.query.projects.findMany({
    where: (projects, operations) =>
      operations.and(
        operations.eq(projects.deletedAt, filter?.deleted ? isNotNull(projects.deletedAt) : isNull(projects.deletedAt)),
        operations.not(isNull(projects.syncedAt)),
        operations.eq(projects.visibility, filter?.visibility ?? "public")
      ),
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
      projects: {
        with: {
          user: true,
        },
      },
      project_participants: {
        with: {
          project: {
            with: {
              user: true,
            },
          },
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

const sstConstructs = async () => {
  const sstConstructs = [
    "Api",
    "ApiGatewayV1Api",
    "App",
    "AppSyncApi",
    "AstroSite",
    "Auth",
    "Bucket",
    "Cognito",
    "Config",
    "Cron",
    "EventBus",
    "Function",
    "Job",
    "KinesisStream",
    "Metadata",
    "NextjsSite",
    "Queue",
    "RDS",
    "RemixSite",
    "Script",
    "Service",
    "SolidStartSite",
    "Stack",
    "StaticSite",
    "SvelteKitSite",
    "Table",
    "Topic",
    "WebSocketApi",
  ];

  // convert to object Record<string, boolean>
  return sstConstructs.reduce((acc, x) => ({ ...acc, [x]: false }), {}) as Partial<
    Record<
      string,
      | {
          id: string;
          type: string;
          href: string;
          name: string;
          meta: {
            line: number;
            file: string;
            import: string;
            code: string[];
          };
        }
      | false
    >
  >;
};

export const analyze = z
  .function(
    z.tuple([
      z.array(
        z.object({
          content: z.string(),
          path: z.string(),
        })
      ),
      z.object({
        exclude: z
          .object({
            constructs: z.array(z.string()).default([]),
          })
          .optional(),
      }),
    ])
  )
  .implement(async (fileContents, options) => {
    let imports: Awaited<ReturnType<typeof GitHubUtils.extractImports>> = {};
    for (let i = 0; i < fileContents.length; i++) {
      const fc = fileContents[i];
      const imp = await GitHubUtils.extractImports(fc, ["StackContext", "use"]);
      imports = Object.assign(imports, imp);
    }
    const exludeConstructs = options?.exclude?.constructs ?? [];
    const imps = Array.from(Object.keys(imports)).filter((x) => !exludeConstructs.includes(x));
    const availableConstructs = await sstConstructs();
    let result = {
      constructs: availableConstructs,
    };
    let constructNames = Object.keys(availableConstructs);
    // check if the imports are in the result.constructs object and turn them to true
    for (let i = 0; i < imps.length; i++) {
      const imp = imps[i];
      if (constructNames.includes(imp)) {
        const cLink = await Link.findByGroupAndType("constructs", imp.toLowerCase());
        if (cLink) {
          result.constructs[imp] = {
            id: imp,
            type: imp,
            href: `${cLink.url}?ref=oetzi.dev`,
            name: imp,
            meta: imports[imp],
          };
        } else {
          result.constructs[imp] = false;
        }
      }
    }
    return result;
  });

export const updateStack = z
  .function(z.tuple([z.object({ id: z.string().uuid(), stackId: z.string().uuid() })]))
  .implement(async (input) => {
    return update({ id: input.id, stackId: input.stackId });
  });

export const parse = CreateProjectZod.parse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Project = ProjectSelect;
