"use server";

import { revalidatePath } from "next/cache";
import { allow } from "@/lib/services/rate-limit";
import { submitReview } from "@/lib/services/reviews";
import { getCurrentUser } from "@/lib/session";
import { fieldErrors, reviewSchema, submitted } from "@/lib/validation";
import type { FormState } from "@/lib/actions/auth";

export async function submitReviewAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please sign in to leave a review." };

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };
  if (!(await allow(`review:${user.id}`, 10, 3600))) return { success: false, error: "Too many reviews. Try again later." };

  const { eventId, rating, body } = parsed.data;
  const result = await submitReview(user.id, eventId, rating, body);
  if (!result.ok) return { success: false, error: result.error, values: submitted(formData) };
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
