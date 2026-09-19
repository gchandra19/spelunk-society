import { and, asc, count, desc, eq, gt, gte, lt, sql } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import type { CavingEvent, Difficulty } from "@/types/domain";

const { events, rsvps, users, grottos } = tables;

const rsvpCount = sql<number>`(select count(*)::int from ${rsvps} where ${rsvps.eventId} = ${events.id})`;

const eventSelect = {
  id: events.id,
  title: events.title,
  description: events.description,
  caveName: events.caveName,
  startsAt: events.startsAt,
  durationHours: events.durationHours,
  difficulty: events.difficulty,
  capacity: events.capacity,
  status: events.status,
  imageSrc: events.imageSrc,
  imageAlt: events.imageAlt,
  hostId: events.hostId,
  hostUser: users.name,
  grottoName: grottos.name,
  rsvpCount,
};

type Row = {
  id: string; title: string; description: string; caveName: string; startsAt: Date; durationHours: number;
  difficulty: Difficulty; capacity: number; status: "published" | "cancelled"; imageSrc: string; imageAlt: string;
  hostId: string | null; hostUser: string | null; grottoName: string | null; rsvpCount: number;
};

const toEvent = (r: Row): CavingEvent => ({
  id: r.id,
  title: r.title,
  description: r.description,
  caveName: r.caveName,
  eventDate: r.startsAt.toISOString(),
  durationHours: r.durationHours,
  hostedBy: r.grottoName ?? r.hostUser ?? "The Spelunkers Society",
  hostId: r.hostId,
  difficulty: r.difficulty,
  rsvpCount: Number(r.rsvpCount),
  capacity: r.capacity,
  status: r.status,
  image: { src: r.imageSrc, alt: r.imageAlt },
});

const base = () =>
  getDb().select(eventSelect).from(events).leftJoin(users, eq(users.id, events.hostId)).leftJoin(grottos, eq(grottos.id, events.grottoId));

export async function listUpcomingEvents(): Promise<CavingEvent[]> {
  const rows = await base().where(and(eq(events.status, "published"), gte(events.startsAt, new Date()))).orderBy(asc(events.startsAt));
  return rows.map(toEvent);
}

export async function listPastEvents(limit = 50): Promise<CavingEvent[]> {
  const rows = await base().where(and(eq(events.status, "published"), lt(events.startsAt, new Date()))).orderBy(desc(events.startsAt)).limit(limit);
  return rows.map(toEvent);
}

export async function getEvent(id: string): Promise<CavingEvent | null> {
  const [row] = await base().where(eq(events.id, id)).limit(1);
  return row ? toEvent(row) : null;
}

export async function getViewerRsvpAndHostedIds(userId: string) {
  const db = getDb();
  const [going, hosted] = await Promise.all([
    db.select({ id: rsvps.eventId }).from(rsvps).where(eq(rsvps.userId, userId)),
    db.select({ id: events.id }).from(events).where(eq(events.hostId, userId)),
  ]);
  return { rsvpIds: going.map((r) => r.id), hostedIds: hosted.map((r) => r.id) };
}

export async function countMembers(): Promise<number> {
  const [row] = await getDb().select({ n: count() }).from(users);
  return Number(row?.n ?? 0);
}

export type RsvpOutcome = { ok: true; going: boolean; count: number } | { ok: false; error: string };

/** Atomic toggle. The event row is locked so two people can never take the last spot. */
export async function toggleRsvp(userId: string, eventId: string): Promise<RsvpOutcome> {
  return getDb().transaction(async (tx): Promise<RsvpOutcome> => {
    const [ev] = await tx.select().from(events).where(eq(events.id, eventId)).for("update");
    if (!ev || ev.status !== "published") return { ok: false, error: "This expedition is no longer available." };
    if (ev.startsAt <= new Date()) return { ok: false, error: "This expedition has already started." };

    const [existing] = await tx.select().from(rsvps).where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, userId))).limit(1);
    const [{ n }] = await tx.select({ n: count() }).from(rsvps).where(eq(rsvps.eventId, eventId));
    const current = Number(n);

    if (existing) {
      await tx.delete(rsvps).where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, userId)));
      return { ok: true, going: false, count: current - 1 };
    }
    if (current >= ev.capacity) return { ok: false, error: "Sorry, this expedition just filled up." };
    await tx.insert(rsvps).values({ eventId, userId });
    return { ok: true, going: true, count: current + 1 };
  });
}

export interface NewEventInput {
  title: string; description: string; caveName: string; startsAt: Date; durationHours: number;
  difficulty: Difficulty; capacity: number; grottoId: string | null; image: { src: string; alt: string };
}

const MAX_ACTIVE_HOSTED = 20;

export async function createEvent(hostId: string, input: NewEventInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const db = getDb();
  const [{ n }] = await db
    .select({ n: count() })
    .from(events)
    .where(and(eq(events.hostId, hostId), eq(events.status, "published"), gt(events.startsAt, new Date())));
  if (Number(n) >= MAX_ACTIVE_HOSTED) return { ok: false, error: `You can host up to ${MAX_ACTIVE_HOSTED} upcoming expeditions at once.` };

  const [row] = await db
    .insert(events)
    .values({
      title: input.title, description: input.description, caveName: input.caveName, startsAt: input.startsAt,
      durationHours: input.durationHours, difficulty: input.difficulty, capacity: input.capacity, grottoId: input.grottoId,
      imageSrc: input.image.src, imageAlt: input.image.alt, hostId,
    })
    .returning({ id: events.id });
  return { ok: true, id: row.id };
}

export async function cancelEvent(userId: string, role: "member" | "admin", eventId: string): Promise<boolean> {
  const db = getDb();
  const owner = role === "admin" ? undefined : eq(events.hostId, userId);
  const updated = await db
    .update(events)
    .set({ status: "cancelled" })
    .where(and(eq(events.id, eventId), owner))
    .returning({ id: events.id });
  return updated.length > 0;
}
