import { and, asc, desc, eq, lt, sql } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import type { Grotto, GrottoReview } from "@/types/domain";

const { grottos, grottoReviews, users, events, rsvps } = tables;

export async function listGrottos(): Promise<Grotto[]> {
  const rows = await getDb()
    .select({
      id: grottos.id, name: grottos.name, region: grottos.region, description: grottos.description, meets: grottos.meets,
      imageSrc: grottos.imageSrc, imageAlt: grottos.imageAlt,
      // Qualified on purpose: a bare "id" would bind to the subquery's own table, not the outer grotto.
      memberCount: sql<number>`(select count(*)::int from ${users} where ${users.grottoId} = "grottos"."id")`,
      ratingAverage: sql<string | null>`(select round(avg(rating)::numeric, 1) from ${grottoReviews} where ${grottoReviews.grottoId} = "grottos"."id")`,
      ratingCount: sql<number>`(select count(*)::int from ${grottoReviews} where ${grottoReviews.grottoId} = "grottos"."id")`,
    })
    .from(grottos)
    .orderBy(asc(grottos.name));

  return rows.map((g) => ({
    id: g.id, name: g.name, region: g.region, description: g.description, meets: g.meets,
    memberCount: Number(g.memberCount),
    ratingAverage: g.ratingAverage === null ? null : Number(g.ratingAverage),
    ratingCount: Number(g.ratingCount),
    image: { src: g.imageSrc, alt: g.imageAlt },
  }));
}

export async function listGrottoReviews(grottoId: string, limit = 3): Promise<GrottoReview[]> {
  const rows = await getDb()
    .select({ id: grottoReviews.id, authorName: users.name, rating: grottoReviews.rating, body: grottoReviews.body, createdAt: grottoReviews.createdAt })
    .from(grottoReviews)
    .innerJoin(users, eq(users.id, grottoReviews.userId))
    .where(eq(grottoReviews.grottoId, grottoId))
    .orderBy(desc(grottoReviews.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Members of a grotto, or anyone who joined one of its past expeditions, can rate it. One rating each (editable). */
export async function rateGrotto(
  userId: string, grottoId: string, rating: number, body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const [grotto] = await db.select({ id: grottos.id }).from(grottos).where(eq(grottos.id, grottoId)).limit(1);
  if (!grotto) return { ok: false, error: "Grotto not found." };

  const [member] = await db.select({ id: users.id }).from(users).where(and(eq(users.id, userId), eq(users.grottoId, grottoId))).limit(1);
  const [attended] = member
    ? [true]
    : await db
        .select({ id: events.id })
        .from(rsvps)
        .innerJoin(events, eq(events.id, rsvps.eventId))
        .where(and(eq(rsvps.userId, userId), eq(events.grottoId, grottoId), lt(events.startsAt, new Date())))
        .limit(1);
  if (!attended) return { ok: false, error: "Only members of this grotto, or people who joined one of its past expeditions, can rate it." };

  await db
    .insert(grottoReviews)
    .values({ grottoId, userId, rating, body })
    .onConflictDoUpdate({ target: [grottoReviews.grottoId, grottoReviews.userId], set: { rating, body, createdAt: sql`now()` } });
  return { ok: true };
}
