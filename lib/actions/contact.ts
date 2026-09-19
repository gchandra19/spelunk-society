"use server";

import { saveContactMessage } from "@/lib/services/contact";
import { allow } from "@/lib/services/rate-limit";
import { clientIp, getCurrentUser } from "@/lib/session";
import { contactSchema, fieldErrors, submitted } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth";

export async function contactAction(_: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: bots fill every field. Pretend success so they learn nothing.
  if (String(formData.get("website") ?? "") !== "") return { success: true };

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };

  const ip = await clientIp();
  if (!(await allow(`contact:${ip}`, 5, 3600))) return { success: false, error: "You've sent several messages recently. Please try again later.", values: submitted(formData) };

  const user = await getCurrentUser();
  try {
    await saveContactMessage({ name: parsed.data.name, email: parsed.data.email, message: parsed.data.message, userId: user?.id ?? null });
  } catch {
    return { success: false, error: "Could not send your message. Please try again.", values: submitted(formData) };
  }
  return { success: true };
}
