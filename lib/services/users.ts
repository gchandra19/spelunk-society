import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import type { SessionUser } from "@/types/domain";

const { users, sessions } = tables;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

let dummyHash: string | undefined;

export async function createUser(input: { email: string; name: string; password: string; grottoId?: string | null }) {
  const db = getDb();
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, 10);
  const inserted = await db
    .insert(users)
    .values({ email, name: input.name.trim(), passwordHash, grottoId: input.grottoId ?? null })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  return inserted[0]?.id ?? null; // null => email already registered
}

/** Constant-ish time: always runs a bcrypt compare, even for unknown emails. */
export async function verifyCredentials(emailRaw: string, password: string): Promise<string | null> {
  const [row] = await getDb().select().from(users).where(eq(users.email, normalizeEmail(emailRaw))).limit(1);
  dummyHash ??= await bcrypt.hash("dummy-password-for-timing", 10);
  const ok = await bcrypt.compare(password, row?.passwordHash ?? dummyHash);
  return ok && row ? row.id : null;
}

export async function createSession(userId: string): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  const db = getDb();
  await db.insert(sessions).values({ tokenHash: sha256(token), userId, expiresAt: expires });
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date())); // opportunistic cleanup
  return { token, expires };
}

export async function getUserBySessionToken(token: string): Promise<SessionUser | null> {
  const [row] = await getDb()
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await getDb().delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
}
