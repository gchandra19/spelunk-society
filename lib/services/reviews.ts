import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import type { RecentReview, Review } from "@/types/domain";

const { reviews, users, events, rsvps } = tables;

export async function listReviews(eventId: string): Promise<Review[]> {
  const rows = await getDb()
    .select({
      id: reviews.id, eventId: reviews.eventId, userId: reviews.userId, authorName: users.name,
      rating: reviews.rating, body: reviews.body, createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.eventId, eventId))
    .orderBy(desc(reviews.createdAt))
    .limit(100);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Latest reviews across all finished expeditions, for the public home page. */
export async function listRecentReviews(limit = 6): Promise<RecentReview[]> {
  const rows = await getDb()
    .select({
      id: reviews.id, eventId: reviews.eventId, userId: reviews.userId, authorName: users.name, rating: reviews.rating,
      body: reviews.body, createdAt: reviews.createdAt, eventTitle: events.title,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .innerJoin(events, eq(events.id, reviews.eventId))
    .where(eq(events.status, "published"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Only people who RSVP'd can review, and only once the expedition has finished. One review per person (editable). */
export async function submitReview(
  userId: string, eventId: string, rating: number, body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const [ev] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!ev) return { ok: false, error: "Expedition not found." };

  const endsAt = ev.startsAt.getTime() + ev.durationHours * 3_600_000;
  if (ev.status !== "published" || endsAt > Date.now()) return { ok: false, error: "You can review an expedition once it has finished." };

  const [went] = await db.select().from(rsvps).where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, userId))).limit(1);
  if (!went) return { ok: false, error: "Only people who joined this expedition can review it." };

  await db
    .insert(reviews)
    .values({ eventId, userId, rating, body })
    .onConflictDoUpdate({ target: [reviews.eventId, reviews.userId], set: { rating, body, createdAt: sql`now()` } });
  return { ok: true };
}
