"use server";

import { revalidatePath } from "next/cache";
import { allow } from "@/lib/services/rate-limit";
import { createUser, verifyCredentials } from "@/lib/services/users";
import { clientIp, endSession, startSession } from "@/lib/session";
import { fieldErrors, signInSchema, signUpSchema, submitted } from "@/lib/validation";
import type { ActionResult } from "@/types/domain";

export type FormState = ActionResult | null;

const tooMany = (formData: FormData): FormState => ({ success: false, error: "Too many attempts. Please wait a few minutes and try again.", values: submitted(formData) });

export async function signUpAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };

  const ip = await clientIp();
  if (!(await allow(`signup:${ip}`, 5, 3600))) return tooMany(formData);

  try {
    const id = await createUser(parsed.data);
    if (!id) return { success: false, error: "An account with this email already exists.", fieldErrors: { email: "Already registered" }, values: submitted(formData) };
    await startSession(id);
  } catch {
    return { success: false, error: "Could not create your account. Please try again.", values: submitted(formData) };
  }
  revalidatePath("/");
  revalidatePath("/grottos");
  return { success: true };
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
