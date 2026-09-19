import { config } from "dotenv";
config({ path: ".env.local" });

import { PHOTOS, SEED_EVENTS } from "../lib/data/events";
import { SEED_GROTTOS } from "../lib/data/grottos";
import { getDb, tables } from "../lib/db";

async function main() {
  const db = getDb();
  await db.insert(tables.grottos).values([...SEED_GROTTOS]).onConflictDoNothing();

  const grottoByName = new Map<string, string>(SEED_GROTTOS.map((g) => [g.name, g.id]));
  await db
    .insert(tables.events)
    .values(
      SEED_EVENTS.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        caveName: e.caveName,
        startsAt: new Date(e.eventDate),
        durationHours: e.durationHours,
        difficulty: e.difficulty,
        capacity: e.capacity,
        imageSrc: PHOTOS[e.photo].src,
        imageAlt: PHOTOS[e.photo].alt,
        grottoId: grottoByName.get(e.hostedBy) ?? null,
      })),
    )
    .onConflictDoNothing();

  console.log(`Seeded ${SEED_GROTTOS.length} grottos and ${SEED_EVENTS.length} events (existing rows untouched).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
