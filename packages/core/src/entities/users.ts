import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProfileSelect, profiles, users, sessions, allowed_users } from "../drizzle/sql/schema";
import dayjs from "dayjs";

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
      projects: true,
      project_participants: {
        with: {
          project: true,
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
  const [x] = await db
    .select({
      count: sql<number>`COUNT(${users.id})`,
    })
    .from(users)
    .where(and(isNull(users.deletedAt), eq(users.email, input.email)));
  const [isInAllowedUsers] = await db
    .select({
      count: sql<number>`COUNT(${users.id})`,
    })
    .from(allowed_users)
    .where(and(isNull(allowed_users.deletedAt), eq(allowed_users.email, input.email)));
  return x.count === 0 && isInAllowedUsers.count > 0;
});

export type Frontend = Awaited<ReturnType<typeof findById>>;

export type Profile = ProfileSelect;
