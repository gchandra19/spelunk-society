import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createSession, deleteSession, getUserBySessionToken } from "@/lib/services/users";
import type { SessionUser } from "@/types/domain";

const COOKIE = "spelunkers_session";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? getUserBySessionToken(token) : null;
});

export async function startSession(userId: string): Promise<void> {
  const { token, expires } = await createSession(userId);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await deleteSession(token);
  jar.delete(COOKIE);
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
