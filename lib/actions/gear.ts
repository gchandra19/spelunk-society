"use server";

import { revalidatePath } from "next/cache";
import { submitGearReview } from "@/lib/services/gear";
import { allow } from "@/lib/services/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { fieldErrors, gearReviewSchema, submitted } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth";

export async function reviewGearAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to review gear." };

  const parsed = gearReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };
  if (!(await allow(`gear-review:${user.id}`, 20, 3600))) return { success: false, error: "Too many reviews. Try again later.", values: submitted(formData) };

  const result = await submitGearReview(user.id, parsed.data.slug, parsed.data.rating, parsed.data.body);
  if (!result.ok) return { success: false, error: result.error, values: submitted(formData) };
  revalidatePath(`/gear/${parsed.data.slug}`);
  revalidatePath("/gear");
  return { success: true };
}
