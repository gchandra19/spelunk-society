"use client";

import { useActionState, useState } from "react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { submitReviewAction } from "@/lib/actions/reviews";
import type { FormState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";
import { StarInput } from "@/components/forms/StarInput";

export function ReviewForm({ eventId }: { readonly eventId: string }) {
  const { viewer } = useViewer();
  const [state, action, pending] = useActionState<FormState, FormData>(submitReviewAction, null);
  const [rating, setRating] = useState(0);

  if (!viewer.rsvpIds.includes(eventId)) return null;

  return (
    <form action={action} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6" noValidate>
      <h3 className="font-display text-xl font-semibold">How was it?</h3>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="rating" value={rating || ""} />

      <div className="mt-4"><StarInput value={rating} onChange={setRating} /></div>
      {fieldError(state, "rating") && <p className="mt-1 text-xs text-rose-400">{fieldError(state, "rating")}</p>}

      <div className="mt-4">
        <Field label="Your review" name="body" error={fieldError(state, "body")}>
          <textarea id="body" name="body" defaultValue={fieldValue(state, "body")} rows={4} maxLength={1500} required className={inputClass} placeholder="What should future members know?" />
        </Field>
      </div>

      <div className="mt-4 space-y-3">
        <FormError state={state} />
        {state?.success && <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Thanks! Your review is posted.</p>}
        <SubmitButton pending={pending}>Post review</SubmitButton>
      </div>
    </form>
  );
}
