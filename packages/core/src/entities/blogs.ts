import { eq, isNotNull, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { ProjectSelect, blogs, techUsedByProjects, techs } from "../drizzle/sql/schema";

export * as Blog from "./blogs";

export const CreateBlogZod = createInsertSchema(blogs).omit({
  ownerId: true,
});

export type CreateProjectInput = z.infer<typeof CreateBlogZod>;

export const create = z.function(z.tuple([z.string().uuid(), CreateBlogZod])).implement(async (userId, blogInput) => {
  const [x] = await db
    .insert(blogs)
    .values({
      ...blogInput,
      ownerId: userId,
    })
    .returning();
  return x;
});

export const remove = z.function(z.tuple([z.string().uuid(), z.string().uuid()])).implement(async (userId, blogId) => {
  const blog = await db.query.blogs.findFirst({
    where: (blogs, operations) => operations.eq(blogs.id, blogId),
  });
  if (!blog) throw new Error("Blog not found");

  const [x] = await db.delete(blogs).where(eq(blogs.id, blogId)).returning();
  return x;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${blogs.id})`,
    })
    .from(blogs);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.blogs.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {
      user: true,
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.blogs.findMany({
    with: {
      user: true,
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
  return db.query.blogs.findMany({
    where: (blogs, operations) =>
      operations.and(
        operations.eq(blogs.deletedAt, filter?.deleted ? isNotNull(blogs.deletedAt) : isNull(blogs.deletedAt)),
        operations.eq(blogs.visibility, filter?.visibility ?? "public")
      ),
    with: {
      user: true,
    },
    orderBy(fields, order) {
      return [order.desc(fields.updatedAt), order.desc(fields.createdAt)];
    },
  });
});

export const allWithSearch = z
  .function(
    z.tuple([
      z
        .object({
          search: z.string().optional(),
        })
        .optional(),
    ])
  )
  .implement(async (options) => {
    let u = await db.query.users.findFirst({
      with: {
        blogs: {
          where: (blogs, operations) =>
            operations.and(
              operations.eq(blogs.deletedAt, isNull(blogs.deletedAt)),
              typeof options !== "undefined" && typeof options.search !== "undefined"
                ? operations.or(
                    operations.like(blogs.content, `%${options.search}%`),
                    operations.like(blogs.title, `%${options.search}%`)
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
    return u.blogs;
  });

export const update = z
  .function(
    z.tuple([
      createInsertSchema(blogs)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    let [p] = await db
      .update(blogs)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(blogs.id, input.id))
      .returning();
    return p;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateTitle = z
  .function(z.tuple([z.object({ id: z.string().uuid(), title: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, title: input.title });
  });

export const parse = CreateBlogZod.parse;
export const safeParse = CreateBlogZod.safeParse;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Blog = ProjectSelect;
