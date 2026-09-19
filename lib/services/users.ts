import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import type { SessionUser, SkillLevel } from "@/types/domain";

const { users, sessions, grottos } = tables;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

// --- recovery codes: password reset without email -------------------------------------------
// 16 characters from a 32-letter alphabet without lookalikes (80 bits). Shown once, stored only as a hash.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");
const hashCode = (code: string) => sha256(normalizeCode(code));

export function generateRecoveryCode(): string {
  let chars = "";
  for (const byte of randomBytes(16)) chars += CODE_ALPHABET[byte % 32]; // 256 % 32 === 0, so no modulo bias
  return chars.match(/.{4}/g)!.join("-");
}

let dummyHash: string | undefined;

export async function createUser(input: {
  email: string; name: string; password: string; grottoId?: string | null; skillLevel?: SkillLevel;
}): Promise<{ id: string; recoveryCode: string } | null> {
  const recoveryCode = generateRecoveryCode();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const inserted = await getDb()
    .insert(users)
    .values({
      email: normalizeEmail(input.email), name: input.name.trim(), passwordHash, grottoId: input.grottoId ?? null,
      skillLevel: input.skillLevel ?? "beginner", recoveryCodeHash: hashCode(recoveryCode),
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  return inserted[0] ? { id: inserted[0].id, recoveryCode } : null; // null => email already registered
}

/** Replaces the account's recovery code (the old one stops working). Returns the new code, shown once. */
export async function regenerateRecoveryCode(userId: string): Promise<string> {
  const code = generateRecoveryCode();
  await getDb().update(users).set({ recoveryCodeHash: hashCode(code) }).where(eq(users.id, userId));
  return code;
}

/**
 * Sets a new password when the right recovery code is supplied. The code is single-use: it is rotated,
 * and every existing session is revoked. Wrong email and wrong code are indistinguishable to the caller.
 */
export async function resetPasswordWithRecoveryCode(
  emailRaw: string, code: string, newPassword: string,
): Promise<{ ok: true; newRecoveryCode: string } | { ok: false }> {
  const db = getDb();
  const [row] = await db.select({ id: users.id, hash: users.recoveryCodeHash }).from(users).where(eq(users.email, normalizeEmail(emailRaw))).limit(1);

  const stored = Buffer.from(row?.hash ?? sha256("no-such-code"), "utf8");
  const supplied = Buffer.from(hashCode(code), "utf8");
  const match = stored.length === supplied.length && timingSafeEqual(stored, supplied);
  if (!row || !row.hash || !match) return { ok: false };

  const newRecoveryCode = generateRecoveryCode();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash, recoveryCodeHash: hashCode(newRecoveryCode) }).where(eq(users.id, row.id));
  await db.delete(sessions).where(eq(sessions.userId, row.id));
  return { ok: true, newRecoveryCode };
}

// --- credentials and sessions ---------------------------------------------------------------
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
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, skillLevel: users.skillLevel, grottoId: users.grottoId })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await getDb().delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
}

// --- profile --------------------------------------------------------------------------------
export async function setSkillLevel(userId: string, level: SkillLevel): Promise<void> {
  await getDb().update(users).set({ skillLevel: level }).where(eq(users.id, userId));
}

/** Join a club (replacing any previous one), or pass null to leave. */
export async function setGrotto(userId: string, grottoId: string | null): Promise<boolean> {
  const db = getDb();
  if (grottoId) {
    const [g] = await db.select({ id: grottos.id }).from(grottos).where(eq(grottos.id, grottoId)).limit(1);
    if (!g) return false;
  }
  await db.update(users).set({ grottoId }).where(eq(users.id, userId));
  return true;
}
