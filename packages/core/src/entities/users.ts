import { Octokit } from "@octokit/rest";
import dayjs from "dayjs";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import fetch from "node-fetch";
import { Config } from "sst/node/config";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProfileSelect, profiles, sessions, users } from "../drizzle/sql/schema";

export * as User from "./users";

export const create = z
  .function(
    z.tuple([
      createInsertSchema(users),
      createInsertSchema(profiles).omit({
        userId: true,
      }),
      createInsertSchema(sessions).omit({
        userId: true,
      }),
    ])
  )
  .implement(async (userInput, profileInput, sessionInput) => {
    const [x] = await db.insert(users).values(userInput).returning();
    const [y] = await db
      .insert(profiles)
      .values({ ...profileInput, userId: x.id })
      .returning();
    const [z] = await db
      .insert(sessions)
      .values({ ...sessionInput, userId: x.id })
      .returning();
    return {
      ...x,
      profile: y,
      session: z,
    };
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${users.id})`,
    })
    .from(users);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {
      profile: true,
      projects: {
        with: {
          stack: {
            with: {
              usedByTechnologies: {
                with: { technology: true },
              },
            },
          },
          participants: true,
          user: true,
        },
        orderBy(fields, order) {
          return [order.desc(fields.updatedAt), order.desc(fields.createdAt)];
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
      sessions: true,
      stacks: {
        with: {
          stack: {
            with: {
              usedByTechnologies: {
                with: {
                  technology: true,
                },
              },
            },
          },
        },
      },
    },
  });
});

export const findByEmail = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.email, input),
    with: {
      profile: true,
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.users.findMany({
    with: {
      profile: true,
    },
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(users)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    let [u] = await db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, input.id))
      .returning();
    return u;
  });

export const updateTokens = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.object({
        access_token: z.string().optional(),
        refresh_token: z.string().optional(),
        expires_at: z.union([z.number().transform((v) => dayjs.unix(v).toDate()), z.null()]),
        expires_in: z.union([z.number().transform((v) => dayjs.unix(v).toDate()), z.null()]),
      }),
    ])
  )
  .implement(async (id, tokens) => {
    return db
      .update(sessions)
      .set({ ...tokens, updatedAt: new Date() })
      .where(eq(sessions.userId, id))
      .returning();
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export const isAllowedToSignUp = z.function(z.tuple([z.object({ email: z.string() })])).implement(async (input) => {
  return input.email === "oezguerisbert@gmail.com"; // admin user
});

export const getFreshAccessToken = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const user = await findById(input);
  if (!user) throw new Error("User not found");
  const hasAccessTokens = user.sessions.find((s) => s.access_token);
  if (!hasAccessTokens) throw new Error("No access tokens found");
  const expiredAt = hasAccessTokens.expires_at;
  if (!expiredAt) throw new Error("No expired at");
  const expired = dayjs(expiredAt).isBefore(dayjs());
  if (expired) {
    const refresh_token = hasAccessTokens.refresh_token;
    if (!refresh_token) throw new Error("No refresh token found");
    const response = await fetch("https://github.com/login/oauth/access_token", {
      body: JSON.stringify({
        client_id: Config.GITHUB_APP_CLIENT_ID,
        client_secret: Config.GITHUB_APP_CLIENT_SECRET,
        refresh_token,
        grant_type: "refresh_token",
      }),
    })
      .then(
        (r) =>
          r.json() as Promise<{
            access_token: string;
            expires_in: number;
            refresh_token: string;
            refresh_token_expires_in: number;
            scope: string;
            token_type: string;
          }>
      )
      .catch((e) => {
        return { error: e };
      });
    if ("error" in response) throw new Error("Error refreshing token");
    await updateTokens(user.id, {
      expires_at: dayjs().add(response.expires_in, "second").unix(),
      expires_in: response.expires_in,
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    });
  }
  const access_token = hasAccessTokens.access_token;
  if (!access_token) throw new Error("No access token found");
  return access_token;
});

export const allUserStacks = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
  const u = await db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.id, userId),
    with: {
      stacks: {
        with: {
          stack: {
            with: {
              usedByTechnologies: {
                with: {
                  technology: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!u) throw new Error("User not found");
  return u.stacks;
});

// export const allTemplates = z.function(z.tuple([z.string().uuid()])).implement(async (userId) => {
//   const u = await db.query.users.findFirst({
//     where: (users, operations) => operations.eq(users.id, userId),
//     with: {
//     },
//   });
//   if (!u) throw new Error("User not found");
//   return u.templates;
// });

export const getOrganization = z.function(z.tuple([z.string()])).implement(async (auth) => {
  const octo = new Octokit({
    auth,
    request: {
      fetch,
    },
  });
  const { data } = await octo.orgs.get();
  return data.login;
});

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Profile = ProfileSelect;
