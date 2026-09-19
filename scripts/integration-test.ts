import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, inArray } from "drizzle-orm";
import { getDb, tables } from "../lib/db";
import { allow } from "../lib/services/rate-limit";
import { createEvent, getEvent, toggleRsvp } from "../lib/services/events";
import { listReviews, submitReview } from "../lib/services/reviews";
import { listGrottos, rateGrotto } from "../lib/services/grottos";
import { createSession, createUser, deleteSession, getUserBySessionToken, regenerateRecoveryCode, resetPasswordWithRecoveryCode, setGrotto, setSkillLevel, verifyCredentials } from "../lib/services/users";
import { acceptAnswer, createAnswer, createQuestion, getQuestion, listAnswers, toggleVote } from "../lib/services/qa";
import { listGearReviews, submitGearReview } from "../lib/services/gear";

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
    ids.push(id!.id);
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
    difficulty: "Beginner", capacity: 2, region: "Testland", grottoId: null, image: { src: "/images/hero-squeeze.jpg", alt: "test" },
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

  // --- grotto ratings ---
  await db.insert(tables.grottos).values({ id: `${tag}-g`, name: `${tag} Grotto`, region: "x", description: "x", meets: "x", imageSrc: "/images/hero-squeeze.jpg", imageAlt: "t" });
  await db.update(tables.events).set({ grottoId: `${tag}-g` }).where(eq(tables.events.id, past.id));
  check("stranger cannot rate a grotto", !(await rateGrotto(ids[3], `${tag}-g`, 5, "Never been there")).ok);
  check("someone who joined a past expedition can rate it", (await rateGrotto(ids[1], `${tag}-g`, 4, "Good people, good trips")).ok);
  await db.update(tables.users).set({ grottoId: `${tag}-g` }).where(eq(tables.users.id, ids[3]));
  check("a member can rate their grotto", (await rateGrotto(ids[3], `${tag}-g`, 2, "Could be better")).ok);
  const mine = (await listGrottos()).find((g) => g.id === `${tag}-g`)!;
  check("grotto average and counts are correct", mine.ratingCount === 2 && mine.ratingAverage === 3 && mine.memberCount === 1, JSON.stringify([mine.ratingCount, mine.ratingAverage, mine.memberCount]));

  // --- clubs and skill levels ---
  check("joining an unknown club is refused", !(await setGrotto(ids[2], "no-such-club")));
  check("a member can join a club", (await setGrotto(ids[2], `${tag}-g`)) && (await listGrottos()).find((g) => g.id === `${tag}-g`)?.memberCount === 2);
  check("a member can leave a club", (await setGrotto(ids[2], null)) && (await listGrottos()).find((g) => g.id === `${tag}-g`)?.memberCount === 1);
  await setSkillLevel(ids[1], "vertical");
  await db.update(tables.users).set({ role: "expert" }).where(eq(tables.users.id, ids[1]));
  const withBadge = (await listReviews(past.id))[0];
  check("reviews carry the author's level and expert role", withBadge.authorLevel === "vertical" && withBadge.authorRole === "expert", `${withBadge.authorLevel}/${withBadge.authorRole}`);

  // --- Q&A ---
  const qid = await createQuestion(ids[0], { title: `${tag} how do I test this`, body: "A body with enough detail to be valid.", tags: ["test"] });
  check("answer is accepted for posting", (await createAnswer(ids[1], qid, "Here is a useful answer.")).ok);
  check("a second answer from the same person is refused", !(await createAnswer(ids[1], qid, "Another attempt at answering.")).ok);
  const [ans] = await listAnswers(qid, null);
  check("author badge is attached to answers", ans.authorRole === "expert" && ans.authorLevel === "vertical");
  check("you can't mark your own question helpful", !(await toggleVote(ids[0], "question", qid)).ok);
  const up = await toggleVote(ids[2], "question", qid);
  check("marking helpful counts once", up.ok && up.voted && up.score === 1);
  const down = await toggleVote(ids[2], "question", qid);
  check("marking again removes it", down.ok && !down.voted && down.score === 0);
  check("only the asker can accept an answer", !(await acceptAnswer(ids[2], qid, ans.id)).ok);
  const acc = await acceptAnswer(ids[0], qid, ans.id);
  check("the asker can accept", acc.ok && acc.accepted && (await getQuestion(qid))?.acceptedAnswerId === ans.id);
  const un = await acceptAnswer(ids[0], qid, ans.id);
  check("accepting again un-accepts", un.ok && !un.accepted);
  check("question reports its answer count", (await getQuestion(qid))?.answerCount === 1);

  // --- gear reviews ---
  check("gear review saved", (await submitGearReview(ids[1], "helmet", 5, "A great helmet for the price.")).ok);
  check("unknown gear is refused", !(await submitGearReview(ids[1], "no-such-gear", 5, "This does not exist.")).ok);
  await submitGearReview(ids[1], "helmet", 3, "Edited: still fine after a season.");
  const mineGear = (await listGearReviews("helmet")).filter((r) => r.userId === ids[1]);
  check("one gear review per person, editable", mineGear.length === 1 && mineGear[0].rating === 3);

  // --- password recovery code ---
  const recEmail = `${tag}-rec@example.com`;
  const acct = (await createUser({ email: recEmail, name: "Recover Me", password: "correct-horse-battery" }))!;
  ids.push(acct.id);
  check("new accounts get a well-formed recovery code", /^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/.test(acct.recoveryCode), acct.recoveryCode);
  const stale = await createSession(acct.id);
  check("a wrong recovery code is refused", !(await resetPasswordWithRecoveryCode(recEmail, "AAAA-AAAA-AAAA-AAAA", "brand-new-password-1")).ok);
  check("an unknown email is refused", !(await resetPasswordWithRecoveryCode("nobody@example.com", acct.recoveryCode, "brand-new-password-1")).ok);
  check("nothing changed after failed attempts", (await verifyCredentials(recEmail, "correct-horse-battery")) === acct.id);
  const reset = await resetPasswordWithRecoveryCode(recEmail, acct.recoveryCode.toLowerCase().replace(/-/g, " "), "brand-new-password-1");
  check("the right code works (case and spacing forgiven)", reset.ok);
  check("old password stops working", (await verifyCredentials(recEmail, "correct-horse-battery")) === null);
  check("new password works", (await verifyCredentials(recEmail, "brand-new-password-1")) === acct.id);
  check("existing sessions are signed out", (await getUserBySessionToken(stale.token)) === null);
  check("a recovery code cannot be used twice", !(await resetPasswordWithRecoveryCode(recEmail, acct.recoveryCode, "yet-another-password-1")).ok);
  const nextCode = reset.ok ? reset.newRecoveryCode : "";
  const regenerated = await regenerateRecoveryCode(acct.id);
  check("regenerating invalidates the previous code", !(await resetPasswordWithRecoveryCode(recEmail, nextCode, "yet-another-password-1")).ok);
  check("the regenerated code works", (await resetPasswordWithRecoveryCode(recEmail, regenerated, "yet-another-password-1")).ok);

  // --- rate limiter ---
  const key = `${tag}:limit`;
  const attempts = [];
  for (let i = 0; i < 5; i++) attempts.push(await allow(key, 3, 60));
  check("rate limiter allows 3 then blocks", attempts.join() === "true,true,true,false,false", attempts.join());

  // --- cleanup ---
  await db.delete(tables.events).where(inArray(tables.events.id, [eventId, past.id]));
  await db.delete(tables.users).where(inArray(tables.users.id, ids));
  await db.delete(tables.grottos).where(eq(tables.grottos.id, `${tag}-g`));
  await db.delete(tables.rateLimits).where(eq(tables.rateLimits.key, key));

  console.log(failures ? `\n${failures} FAILED` : "\nAll checks passed.");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
