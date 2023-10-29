import { eq, isNotNull, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { links } from "../drizzle/sql/schema";

export * as Link from "./links";

export const CreateLinkZod = createInsertSchema(links)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    meta: true,
  })
  .extend({
    meta: z.array(z.object({ name: z.string(), content: z.string() })),
  });

export type CreateLinkInput = z.infer<typeof CreateLinkZod>;

export const UpdateLinkZod = CreateLinkZod.partial().extend({ id: z.string().uuid() });

export const safeParse = CreateLinkZod.safeParse;
export const safeParseForCreate = CreateLinkZod.omit({
  meta: true,
}).safeParse;

export const safeParseForUpdate = UpdateLinkZod.safeParse;

export const create = z.function(z.tuple([CreateLinkZod])).implement(async (linkInput) => {
  const [x] = await db
    .insert(links)
    .values(
      Object.assign(linkInput, {
        createdAt: new Date(),
      })
    )
    .returning();
  return x;
});

export const remove = z.function(z.tuple([z.string().uuid()])).implement(async (linkId) => {
  const exists = await db.query.links.findFirst({
    where: (links, operations) => operations.eq(links.id, linkId),
  });
  if (!exists) {
    throw new Error(`Link with id ${linkId} does not exist`);
  }
  const deleted = await db.delete(links).where(eq(links.id, exists.id)).returning();
  return deleted;
});

export const update = z.function(z.tuple([z.string().uuid(), UpdateLinkZod])).implement(async (linkId, linkInput) => {
  const exists = await db.query.links.findFirst({
    where: (links, operations) => operations.eq(links.id, linkId),
  });
  if (!exists) {
    throw new Error(`Link with id ${linkId} does not exist`);
  }
  const updated = await db
    .update(links)
    .set({
      ...linkInput,
      updatedAt: new Date(),
    })
    .where(eq(links.id, exists.id))
    .returning();
  return updated;
});

export const all = z.function(z.tuple([])).implement(async () => {
  const thelinks = await db.query.links.findMany({
    where: (links, operations) => operations.and(isNotNull(links.active), isNull(links.deletedAt)),
  });

  return thelinks;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${links.id})`,
    })
    .from(links);
  return x.count;
});

export const findByGroupAndType = z.function(z.tuple([z.string(), z.string()])).implement(async (group, type) =>
  db.query.links.findFirst({
    where: (links, operations) =>
      operations.and(
        operations.eq(links.group, group),
        operations.eq(links.type, type),
        operations.and(isNotNull(links.active), isNull(links.deletedAt))
      ),
  })
);

export const listBy = z.function(z.tuple([z.string()])).implement(async (group) =>
  db.query.links.findMany({
    where: (links, operations) =>
      operations.and(
        operations.eq(links.group, group),
        operations.and(isNotNull(links.active), isNull(links.deletedAt))
      ),
  })
);

export const findById = z.function(z.tuple([z.string().uuid()])).implement(async (id) =>
  db.query.links.findFirst({
    where: (links, operations) =>
      operations.and(operations.eq(links.id, id), operations.and(isNotNull(links.active), isNull(links.deletedAt))),
  })
);

export type Frontend = NonNullable<Awaited<ReturnType<typeof findByGroupAndType>>>;
