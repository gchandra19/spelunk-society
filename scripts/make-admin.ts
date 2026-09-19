// Usage: npm run make-admin -- you@example.com          (grants admin)
//        npm run make-admin -- you@example.com expert   (grants the verified-expert badge)
import { config } from "dotenv";
config({ path: ".env.local" });
import { eq } from "drizzle-orm";
import { getDb, tables } from "../lib/db";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }
  const role = process.argv[3] === "expert" ? "expert" : "admin";
  const updated = await getDb().update(tables.users).set({ role }).where(eq(tables.users.email, email)).returning({ id: tables.users.id });
  console.log(updated.length ? `${email} is now ${role === "admin" ? "an admin" : "a verified expert"}.` : `No account found for ${email}. Sign up first.`);
  process.exit(updated.length ? 0 : 1);
}
main();
