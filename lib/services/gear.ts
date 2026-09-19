import { desc, eq, sql } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import { gearBySlug } from "@/lib/data/gear";
import type { Review } from "@/types/domain";

const { gearReviews, users } = tables;

export async function listGearReviews(slug: string): Promise<Review[]> {
  const rows = await getDb()
    .select({
      id: gearReviews.id, userId: gearReviews.userId, authorName: users.name, authorLevel: users.skillLevel, authorRole: users.role,
      rating: gearReviews.rating, body: gearReviews.body, createdAt: gearReviews.createdAt,
    })
    .from(gearReviews)
    .innerJoin(users, eq(users.id, gearReviews.userId))
    .where(eq(gearReviews.gearSlug, slug))
    .orderBy(desc(gearReviews.createdAt))
    .limit(100);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function gearRatingStats(): Promise<Record<string, { average: number; count: number }>> {
  const rows = await getDb()
    .select({ slug: gearReviews.gearSlug, average: sql<string>`round(avg(${gearReviews.rating})::numeric, 1)`, count: sql<number>`count(*)::int` })
    .from(gearReviews)
    .groupBy(gearReviews.gearSlug);
  return Object.fromEntries(rows.map((r) => [r.slug, { average: Number(r.average), count: Number(r.count) }]));
}

/** One review per person per item, editable. */
export async function submitGearReview(userId: string, slug: string, rating: number, body: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!gearBySlug(slug)) return { ok: false, error: "Unknown gear item." };
  await getDb()
    .insert(gearReviews)
    .values({ gearSlug: slug, userId, rating, body })
    .onConflictDoUpdate({ target: [gearReviews.gearSlug, gearReviews.userId], set: { rating, body, createdAt: sql`now()` } });
  return { ok: true };
}
