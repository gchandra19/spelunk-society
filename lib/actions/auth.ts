"use server";

import { revalidatePath } from "next/cache";
import { allow } from "@/lib/services/rate-limit";
import { createUser, regenerateRecoveryCode, resetPasswordWithRecoveryCode, setGrotto, setSkillLevel, verifyCredentials } from "@/lib/services/users";
import { clientIp, endSession, getCurrentUser, startSession } from "@/lib/session";
import { fieldErrors, recoverySchema, signInSchema, signUpSchema, skillSchema, submitted } from "@/lib/validation";
import type { ActionResult } from "@/types/domain";

export type FormState = ActionResult | null;
export type CodeState = ActionResult<{ recoveryCode?: string }> | null;

const tooMany = (formData: FormData) =>
  ({ success: false, error: "Too many attempts. Please wait a few minutes and try again.", values: submitted(formData) }) as const;

export async function signUpAction(_: CodeState, formData: FormData): Promise<CodeState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };

  const ip = await clientIp();
  if (!(await allow(`signup:${ip}`, 5, 3600))) return tooMany(formData);

  let recoveryCode: string;
  try {
    const created = await createUser(parsed.data);
    if (!created) return { success: false, error: "An account with this email already exists.", fieldErrors: { email: "Already registered" }, values: submitted(formData) };
    await startSession(created.id);
    recoveryCode = created.recoveryCode;
  } catch {
    return { success: false, error: "Could not create your account. Please try again.", values: submitted(formData) };
  }
  revalidatePath("/");
  revalidatePath("/grottos");
  return { success: true, recoveryCode };
}

export async function signInAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Enter a valid email and password.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };

  const ip = await clientIp();
  const okIp = await allow(`signin:ip:${ip}`, 30, 900);
  const okAcct = await allow(`signin:acct:${parsed.data.email}`, 8, 900);
  if (!okIp || !okAcct) return tooMany(formData);

  const userId = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!userId) return { success: false, error: "Incorrect email or password.", values: submitted(formData) };

  await startSession(userId);
  return { success: true };
}

export async function signOutAction(): Promise<void> {
  await endSession();
}

/** Forgot password: needs the email plus the recovery code shown at sign-up. No email service required. */
export async function recoverPasswordAction(_: CodeState, formData: FormData): Promise<CodeState> {
  const parsed = recoverySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };

  const ip = await clientIp();
  const okIp = await allow(`recover:ip:${ip}`, 10, 3600);
  const okAcct = await allow(`recover:acct:${parsed.data.email}`, 5, 3600);
  if (!okIp || !okAcct) return tooMany(formData);

  const result = await resetPasswordWithRecoveryCode(parsed.data.email, parsed.data.code, parsed.data.password);
  if (!result.ok) return { success: false, error: "That email and recovery code don't match.", values: submitted(formData) };
  return { success: true, recoveryCode: result.newRecoveryCode };
}

/** Issue a fresh recovery code (the old one stops working). Requires the current password. */
export async function regenerateRecoveryCodeAction(_: CodeState, formData: FormData): Promise<CodeState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in first." };
  if (!(await allow(`regen-code:${user.id}`, 5, 3600))) return { success: false, error: "Too many attempts. Try again later." };

  const password = String(formData.get("password") ?? "");
  if (!(await verifyCredentials(user.email, password))) return { success: false, error: "That password is incorrect.", fieldErrors: { password: "Incorrect password" } };
  return { success: true, recoveryCode: await regenerateRecoveryCode(user.id) };
}

export async function setSkillLevelAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in first." };
  const parsed = skillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Choose a level." };
  await setSkillLevel(user.id, parsed.data.skillLevel);
  return { success: true };
}

/** Join a club, or pass "" to leave. Members can belong to one club at a time. */
export async function setClubAction(grottoId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to join a club." };
  if (!(await allow(`club:${user.id}`, 20, 3600))) return { success: false, error: "Too many changes. Try again later." };
  const ok = await setGrotto(user.id, grottoId ? String(grottoId).slice(0, 50) : null);
  if (!ok) return { success: false, error: "That club doesn't exist." };
  revalidatePath("/grottos");
  revalidatePath("/grottos/[id]", "page");
  revalidatePath("/");
  return { success: true };
}
