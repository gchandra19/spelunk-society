// Usage: npm run make-admin -- you@example.com
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
  const updated = await getDb().update(tables.users).set({ role: "admin" }).where(eq(tables.users.email, email)).returning({ id: tables.users.id });
  console.log(updated.length ? `${email} is now an admin.` : `No account found for ${email}. Sign up first.`);
  process.exit(updated.length ? 0 : 1);
}
main();
