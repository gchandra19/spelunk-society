"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { submitReviewAction } from "@/lib/actions/reviews";
import type { FormState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";

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

      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)} className="rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
            <Star size={28} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"} />
          </button>
        ))}
      </div>
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
