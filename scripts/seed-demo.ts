// Demo content: fictional members, past expeditions at real caves, and their reviews.
// Idempotent (fixed ids + onConflictDoNothing). Demo accounts get an unusable random password, so nobody can sign in as them.
// Remove everything again with: npm run db:unseed:demo
import { config } from "dotenv";
config({ path: ".env.local" });

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { like } from "drizzle-orm";
import { PHOTOS, type PhotoKey } from "../lib/data/photos";
import { getDb, tables } from "../lib/db";

const DAY = 86_400_000;
const at = (iso: string) => new Date(iso);

const USERS = [
  ["Maya Okafor", "central"], ["Liam Hendricks", "central"], ["Priya Nair", "rescue"], ["Tomás Herrera", "rescue"],
  ["Grace Whitfield", "central"], ["Jonas Berg", "central"], ["Aiko Tanaka", "rescue"], ["Daniel Reyes", "central"],
  ["Sofia Marchetti", null], ["Ethan Brooks", "rescue"], ["Nadia Petrova", "central"], ["Owen Gallagher", null],
  ["Hana Kim", "central"], ["Marcus Bell", "rescue"],
] as const;

const uid = (n: number) => `demo-u${String(n).padStart(2, "0")}`; // n is 1-based
const email = (name: string) => `${name.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").replace(/ /g, ".")}@demo.spelunkers.example`;

interface PastEvent {
  title: string; description: string; cave: string; date: string; hours: number;
  difficulty: "Beginner" | "Vertical" | "Rescue"; capacity: number; grotto: "central" | "rescue"; host: number; photo: PhotoKey;
  extraAttendees: number[];
}

const EVENTS: PastEvent[] = [
  { title: "Mammoth Cave Historic Route Walk", description: "A guided walk along the big trunk passages of Mammoth Cave, Kentucky, with stops on the cave's human history. Great first trip underground.", cave: "Mammoth Cave, KY", date: "2026-03-14T14:00:00Z", hours: 4, difficulty: "Beginner", capacity: 30, grotto: "central", host: 1, photo: "mammothAvenue", extraAttendees: [2, 11] },
  { title: "Broadway Passage Survey Day", description: "Hands-on cave survey in one of Mammoth Cave's largest passages: compass, clinometer and tape, then plot the data into a map.", cave: "Mammoth Cave, KY", date: "2026-04-11T15:00:00Z", hours: 5, difficulty: "Beginner", capacity: 12, grotto: "central", host: 6, photo: "mammothBroadway", extraAttendees: [2, 13] },
  { title: "Carlsbad Big Room Photography Trip", description: "Learn low-light cave photography in the Big Room of Carlsbad Cavern, New Mexico. Tripods welcome; formations stay untouched.", cave: "Carlsbad Cavern, NM", date: "2026-04-25T16:00:00Z", hours: 4, difficulty: "Beginner", capacity: 20, grotto: "central", host: 2, photo: "carlsbad", extraAttendees: [1, 11] },
  { title: "Wind Cave Boxwork Study Trip", description: "A small-group trip to see the world's finest boxwork calcite in Wind Cave, South Dakota, with a guide who explains how it formed.", cave: "Wind Cave, SD", date: "2026-05-16T15:00:00Z", hours: 5, difficulty: "Beginner", capacity: 12, grotto: "central", host: 11, photo: "windCave", extraAttendees: [1] },
  { title: "Lava Tube Exploration: Merrill Cave", description: "Scramble into a collapsed skylight and explore a lava tube at Lava Beds National Monument, California. Helmet and three lights required.", cave: "Merrill Cave, Lava Beds NM, CA", date: "2026-06-06T17:00:00Z", hours: 4, difficulty: "Beginner", capacity: 15, grotto: "central", host: 5, photo: "lavaBeds", extraAttendees: [8, 11] },
  { title: "Single Rope Technique Skills Weekend", description: "Two days of ascending, descending, changeovers and rebelays on a fixed rigging site, taught in small groups with every rig checked.", cave: "Spirit World, Carlsbad Cavern, NM", date: "2026-06-27T14:00:00Z", hours: 8, difficulty: "Vertical", capacity: 10, grotto: "rescue", host: 3, photo: "rope", extraAttendees: [] },
  { title: "Cave Rescue Litter Handling Drill", description: "A realistic evacuation scenario with regional rescue teams: packaging a patient, moving a litter through a tight passage, and a full debrief.", cave: "Jewel Cave, SD", date: "2026-07-18T13:00:00Z", hours: 8, difficulty: "Rescue", capacity: 12, grotto: "rescue", host: 4, photo: "rescue", extraAttendees: [6] },
  { title: "Squeeze Techniques Clinic", description: "Body positioning, breathing and route-finding for tight passages, practised on a training tube before a short trip into Crystal Passage.", cave: "Crystal Passage", date: "2026-08-08T16:00:00Z", hours: 4, difficulty: "Beginner", capacity: 10, grotto: "central", host: 8, photo: "squeeze", extraAttendees: [2, 11] },
  { title: "Summer Cleanup & Conservation Day", description: "Trash haul, trail repair and a short guided walk at a popular lava tube entrance. Gloves and water provided.", cave: "Lava Tube Entrance", date: "2026-08-29T15:00:00Z", hours: 4, difficulty: "Beginner", capacity: 40, grotto: "central", host: 1, photo: "group", extraAttendees: [1, 2, 5, 6, 8, 10, 11, 12, 14, 9] },
];

// [event index, user (1-based), rating, text]
const REVIEWS: [number, number, number, string][] = [
  [0, 5, 5, "Perfect first cave trip. The guides paced it for everyone and the passage is enormous. Bring a light layer, it stays cool all day."],
  [0, 9, 4, "Great intro. I learned a lot about the cave's history, though the group was big enough that it was hard to hear at the back."],
  [0, 12, 5, "I had never done anything like this and felt safe the whole time. Already signed up for the next one."],
  [0, 13, 4, "Lovely route and well organised. Would have liked a short break halfway."],
  [1, 6, 5, "Finally understood how survey shots actually work. Small teams and real hands-on time with the compass and clinometer."],
  [1, 8, 4, "Good day. Tape handling was chaotic until we found a system, but the leaders sorted it out quickly."],
  [1, 11, 5, "Best beginner-friendly technical day I've done. The notes were clear and we left with data we actually used."],
  [1, 1, 5, "Great mix of learning and doing. Plotting the final map was really satisfying."],
  [2, 2, 5, "The Big Room is even better in person. The tripod tips from the trip leader made a huge difference."],
  [2, 5, 4, "Beautiful cave, but the lighting is tricky. Bring a fast lens and some patience."],
  [2, 9, 5, "Came for the photos, stayed for the people. Very welcoming group."],
  [2, 13, 3, "Lovely location, but the pace was slow for me and there was a lot of standing around while people set up shots."],
  [3, 6, 5, "Boxwork is unreal. Nothing prepares you for how delicate it looks up close. The leaders were strict about not touching, which was right."],
  [3, 11, 5, "Small group, great guide. I learned a lot about how the formations grow."],
  [3, 14, 4, "Fascinating trip. The tight sections near the end were a squeeze but worth it."],
  [3, 8, 4, "Well organised with a good safety briefing. Lots of steps on the way out, so knees beware."],
  [4, 12, 5, "Wild landscape and an easy scramble in. The skylight moment is worth the trip on its own."],
  [4, 1, 4, "Cold, dark and wonderful. Helmets and three lights, exactly as promised."],
  [4, 2, 4, "Great intro to lava tubes. The footing is uneven, so proper boots matter."],
  [4, 6, 3, "Fun trip, but the meeting point was confusing. Better directions next time, please."],
  [5, 3, 5, "Excellent coaching. I arrived nervous on rope and left comfortable with changeovers."],
  [5, 4, 5, "Exactly the right ratio of instructors to students. Every rig was checked before we descended."],
  [5, 7, 5, "Serious and safety-first, and still fun. Highly recommend to anyone starting vertical."],
  [5, 10, 4, "Great weekend. Long days, so pace yourself and eat properly."],
  [5, 14, 4, "Solid instruction. I'd have liked a bit more time on rebelays."],
  [6, 3, 5, "Realistic scenario, calm leadership, and a debrief that actually taught us something."],
  [6, 4, 5, "Litter handling in a tight passage is harder than it looks. Great practice with the regional teams."],
  [6, 10, 4, "Well run. Communication was the hardest part, which I think was the point."],
  [6, 7, 5, "The best rescue training I've attended. Clear roles and honest feedback."],
  [7, 1, 5, "I was terrified of tight spots and now I'm not. Patient coaching and a very supportive group."],
  [7, 12, 5, "Learned breathing and body-position tricks that made a real difference."],
  [7, 13, 4, "Useful and fun. The practice tube needed more variety, but the tips were gold."],
  [7, 8, 3, "Good content, but it ran over time and we lost the last exercise."],
  [8, 9, 5, "Great community day. We hauled out a shocking amount of trash."],
  [8, 11, 4, "Feels good to give something back. Bring gloves and water."],
  [8, 10, 4, "Well organised, and the guided walk at the end was a nice bonus."],
  [8, 2, 5, "Loved the mix of work and socialising. I'll do it every year."],
];

// [grotto, user (1-based), rating, text]
const GROTTO_REVIEWS: ["central" | "rescue", number, number, string][] = [
  ["central", 1, 5, "Welcoming from the very first meeting. The gear library got me started without spending a fortune."],
  ["central", 2, 5, "Trips are well planned and the leaders genuinely care about newcomers."],
  ["central", 5, 4, "Great community. Meetings run a little long, but the trips make up for it."],
  ["central", 6, 5, "The survey archive alone is worth joining for. Very knowledgeable people."],
  ["central", 8, 4, "Friendly, organised and safety-minded. More weekday options would be nice."],
  ["central", 11, 5, "My favourite club so far. Regular trips and no pressure to be an expert."],
  ["central", 13, 4, "Solid grotto with a good mix of beginner and technical trips."],
  ["central", 9, 5, "Not a member yet, but I've joined three trips and every one has been excellent."],
  ["rescue", 3, 5, "Professional, serious and supportive. I've learned more here than anywhere."],
  ["rescue", 4, 5, "Training is realistic and well debriefed. Great people to trust in a bad situation."],
  ["rescue", 7, 5, "Rigorous standards without the ego. Exactly what a rescue group should be."],
  ["rescue", 10, 4, "Demanding but worth it. Expect to commit your weekends."],
  ["rescue", 14, 4, "Excellent instruction. Prerequisites are strict, so plan your skills ahead."],
];

async function main() {
  const db = getDb();
  const { users, events, rsvps, reviews, grottoReviews } = tables;

  // Unusable password: random bytes hashed once and never revealed.
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  await db.insert(users).values(
    USERS.map(([name, grotto], i) => ({
      id: uid(i + 1), name, email: email(name), passwordHash, grottoId: grotto, createdAt: at("2026-01-10T12:00:00Z"),
    })),
  ).onConflictDoNothing();

  const eventId = (i: number) => `demo-e${i + 1}`;
  await db.insert(events).values(
    EVENTS.map((e, i) => ({
      id: eventId(i), title: e.title, description: e.description, caveName: e.cave, startsAt: at(e.date),
      durationHours: e.hours, difficulty: e.difficulty, capacity: e.capacity, imageSrc: PHOTOS[e.photo].src,
      imageAlt: PHOTOS[e.photo].alt, hostId: uid(e.host), grottoId: e.grotto, createdAt: at("2026-01-20T12:00:00Z"),
    })),
  ).onConflictDoNothing();

  // Everyone who reviewed an event attended it, plus the listed extras and the host.
  const rsvpRows = new Map<string, { eventId: string; userId: string; createdAt: Date }>();
  const addRsvp = (ei: number, u: number) =>
    rsvpRows.set(`${ei}:${u}`, { eventId: eventId(ei), userId: uid(u), createdAt: new Date(at(EVENTS[ei].date).getTime() - 10 * DAY) });
  EVENTS.forEach((e, ei) => { addRsvp(ei, e.host); e.extraAttendees.forEach((u) => addRsvp(ei, u)); });
  REVIEWS.forEach(([ei, u]) => addRsvp(ei, u));
  await db.insert(rsvps).values([...rsvpRows.values()]).onConflictDoNothing();

  await db.insert(reviews).values(
    REVIEWS.map(([ei, u, rating, body]) => ({
      id: `demo-r-${ei + 1}-${u}`, eventId: eventId(ei), userId: uid(u), rating, body,
      createdAt: new Date(at(EVENTS[ei].date).getTime() + EVENTS[ei].hours * 3_600_000 + (1 + ((ei + u) % 5)) * DAY),
    })),
  ).onConflictDoNothing();

  await db.insert(grottoReviews).values(
    GROTTO_REVIEWS.map(([grotto, u, rating, body], i) => ({
      id: `demo-gr-${grotto}-${u}`, grottoId: grotto, userId: uid(u), rating, body, createdAt: at(`2026-09-${String(1 + (i % 15)).padStart(2, "0")}T12:00:00Z`),
    })),
  ).onConflictDoNothing();

  console.log(`Demo data: ${USERS.length} members, ${EVENTS.length} past expeditions, ${rsvpRows.size} RSVPs, ${REVIEWS.length} reviews, ${GROTTO_REVIEWS.length} grotto ratings.`);
  process.exit(0);
}

async function unseed() {
  const db = getDb();
  await db.delete(tables.events).where(like(tables.events.id, "demo-e%"));
  const removed = await db.delete(tables.users).where(like(tables.users.id, "demo-u%")).returning({ id: tables.users.id });
  console.log(`Removed demo data (${removed.length} members; their reviews and RSVPs cascade).`);
  process.exit(0);
}

(process.argv.includes("--remove") ? unseed() : main()).catch((e) => {
  console.error(e);
  process.exit(1);
});
