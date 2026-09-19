"use server";

import { revalidatePath } from "next/cache";
import { allow } from "@/lib/services/rate-limit";
import { rateGrotto } from "@/lib/services/grottos";
import { getCurrentUser } from "@/lib/session";
import { fieldErrors, grottoReviewSchema, submitted } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth";

export async function rateGrottoAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to rate a grotto." };

  const parsed = grottoReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };
  if (!(await allow(`grotto-review:${user.id}`, 10, 3600))) return { success: false, error: "Too many ratings. Try again later.", values: submitted(formData) };

  const { grottoId, rating, body } = parsed.data;
  const result = await rateGrotto(user.id, grottoId, rating, body);
  if (!result.ok) return { success: false, error: result.error, values: submitted(formData) };
  revalidatePath("/grottos");
  return { success: true };
}
