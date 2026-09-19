"use server";

import { revalidatePath } from "next/cache";
import { PHOTOS } from "@/lib/data/photos";
import { cancelEvent, createEvent, toggleRsvp } from "@/lib/services/events";
import { allow } from "@/lib/services/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { createEventSchema, fieldErrors, submitted } from "@/lib/validation";
import type { ActionResult } from "@/types/domain";
import type { FormState } from "@/lib/actions/auth";

const SIGN_IN_REQUIRED = { success: false, error: "Please sign in to continue." } as const;

function refreshEventPages(eventId?: string) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/my-expeditions");
  if (eventId) revalidatePath(`/events/${eventId}`);
}

export async function toggleRSVP(eventId: string): Promise<ActionResult<{ going: boolean; count: number }>> {
  if (typeof eventId !== "string" || eventId.length > 64) return { success: false, error: "Invalid expedition." };
  const user = await getCurrentUser();
  if (!user) return SIGN_IN_REQUIRED;
  if (!(await allow(`rsvp:${user.id}`, 60, 60))) return { success: false, error: "You're going too fast. Try again in a minute." };

  const result = await toggleRsvp(user.id, eventId);
  if (!result.ok) return { success: false, error: result.error };
  refreshEventPages(eventId);
  return { success: true, going: result.going, count: result.count };
}

export async function createEventAction(_: FormState, formData: FormData): Promise<FormState & { eventId?: string }> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN_REQUIRED;

  const parsed = createEventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };
  if (!(await allow(`create-event:${user.id}`, 5, 3600))) return { success: false, error: "You've created several expeditions recently. Please try again later.", values: submitted(formData) };

  const { photo, ...rest } = parsed.data;
  try {
    const result = await createEvent(user.id, { ...rest, image: PHOTOS[photo] });
    if (!result.ok) return { success: false, error: result.error, values: submitted(formData) };
    refreshEventPages();
    return { success: true, eventId: result.id };
  } catch {
    return { success: false, error: "Could not create the expedition. Check the grotto selection and try again.", values: submitted(formData) };
  }
}

export async function cancelEventAction(eventId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN_REQUIRED;
  if (!(await allow(`cancel:${user.id}`, 20, 3600))) return { success: false, error: "Too many requests." };
  const ok = await cancelEvent(user.id, user.role, String(eventId).slice(0, 64));
  if (!ok) return { success: false, error: "Only the host can cancel this expedition." };
  refreshEventPages(eventId);
  return { success: true };
}
