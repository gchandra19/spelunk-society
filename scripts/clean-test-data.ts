import { config } from "dotenv";
config({ path: ".env.local" });
import { like } from "drizzle-orm";
import { getDb, tables } from "../lib/db";

async function main() {
  const db = getDb();
  await db.delete(tables.events).where(like(tables.events.title, "E2E %"));
  const removed = await db.delete(tables.users).where(like(tables.users.email, "e2e-%@example.com")).returning({ id: tables.users.id });
  await db.delete(tables.rateLimits).where(like(tables.rateLimits.key, "signup:%"));
  console.log(`Removed ${removed.length} leftover test user(s).`);
  process.exit(0);
}
main();
