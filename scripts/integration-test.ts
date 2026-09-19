import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, inArray } from "drizzle-orm";
import { getDb, tables } from "../lib/db";
import { allow } from "../lib/services/rate-limit";
import { createEvent, getEvent, toggleRsvp } from "../lib/services/events";
import { listReviews, submitReview } from "../lib/services/reviews";
import { createSession, createUser, deleteSession, getUserBySessionToken, verifyCredentials } from "../lib/services/users";

let failures = 0;
const check = (name: string, ok: boolean, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` (${extra})` : ""}`);
  if (!ok) failures++;
};

async function main() {
  const db = getDb();
  const tag = `test-${Date.now()}`;
  const emails = [0, 1, 2, 3].map((i) => `${tag}-${i}@example.com`);
  const ids: string[] = [];

  // --- auth ---
  for (const [i, email] of emails.entries()) {
    const id = await createUser({ email, name: `Tester ${i}`, password: "correct-horse-battery" });
    ids.push(id!);
  }
  check("users created", ids.every(Boolean));
  check("duplicate email rejected (case-insensitive)", (await createUser({ email: emails[0].toUpperCase(), name: "Dup", password: "correct-horse-battery" })) === null);
  check("good password verifies", (await verifyCredentials(emails[0], "correct-horse-battery")) === ids[0]);
  check("bad password rejected", (await verifyCredentials(emails[0], "wrong")) === null);
  check("unknown email rejected", (await verifyCredentials("nobody@example.com", "x")) === null);

  const { token } = await createSession(ids[0]);
  check("session resolves user", (await getUserBySessionToken(token))?.id === ids[0]);
  const stored = await db.select().from(tables.sessions).where(eq(tables.sessions.userId, ids[0]));
  check("raw token is not stored", stored.every((s) => s.tokenHash !== token));
  await deleteSession(token);
  check("session revoked", (await getUserBySessionToken(token)) === null);

  // --- events + RSVP capacity race ---
  const start = new Date(Date.now() + 7 * 86_400_000);
  const created = await createEvent(ids[0], {
    title: `${tag} capacity test`, description: "x", caveName: "Test Cave", startsAt: start, durationHours: 2,
    difficulty: "Beginner", capacity: 2, grottoId: null, image: { src: "/images/hero-squeeze.jpg", alt: "test" },
  });
  check("event created", created.ok);
  const eventId = created.ok ? created.id : "";

  const results = await Promise.all([1, 2, 3].map((i) => toggleRsvp(ids[i], eventId)));
  const won = results.filter((r) => r.ok).length;
  check("capacity 2: exactly 2 of 3 concurrent RSVPs succeed", won === 2, `${won} succeeded`);
  check("count matches capacity", (await getEvent(eventId))?.rsvpCount === 2);

  const winner = ids.slice(1).find((_, i) => results[i].ok)!;
  const cancel = await toggleRsvp(winner, eventId);
  check("toggle off frees a spot", cancel.ok && !cancel.going && cancel.count === 1);

  // --- past event + reviews ---
  const [past] = await db
    .insert(tables.events)
    .values({
      title: `${tag} past`, description: "x", caveName: "Old Cave", startsAt: new Date(Date.now() - 3 * 86_400_000),
      durationHours: 2, difficulty: "Vertical", capacity: 5, imageSrc: "/images/rope.jpg", imageAlt: "t", hostId: ids[0],
    })
    .returning({ id: tables.events.id });
  await db.insert(tables.rsvps).values({ eventId: past.id, userId: ids[1] });

  const rsvpPast = await toggleRsvp(ids[2], past.id);
  check("cannot RSVP to a started event", !rsvpPast.ok);
  check("attendee can review", (await submitReview(ids[1], past.id, 5, "Great trip")).ok);
  check("non-attendee cannot review", !(await submitReview(ids[2], past.id, 4, "I was not there")).ok);
  check("cannot review upcoming event", !(await submitReview(winner, eventId, 5, "too early")).ok);
  await submitReview(ids[1], past.id, 3, "Edited");
  const reviews = await listReviews(past.id);
  check("one review per person, editable", reviews.length === 1 && reviews[0].rating === 3 && reviews[0].body === "Edited");

  // --- rate limiter ---
  const key = `${tag}:limit`;
  const attempts = [];
  for (let i = 0; i < 5; i++) attempts.push(await allow(key, 3, 60));
  check("rate limiter allows 3 then blocks", attempts.join() === "true,true,true,false,false", attempts.join());

  // --- cleanup ---
  await db.delete(tables.events).where(inArray(tables.events.id, [eventId, past.id]));
  await db.delete(tables.users).where(inArray(tables.users.id, ids));
  await db.delete(tables.rateLimits).where(eq(tables.rateLimits.key, key));

  console.log(failures ? `\n${failures} FAILED` : "\nAll checks passed.");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
