"use client";

import { useActionState, useState } from "react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { rateGrottoAction } from "@/lib/actions/grottos";
import type { FormState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";
import { StarInput } from "@/components/forms/StarInput";

export function GrottoRatingForm({ grottoId, grottoName }: { readonly grottoId: string; readonly grottoName: string }) {
  const { viewer, loaded } = useViewer();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, action, pending] = useActionState<FormState, FormData>(rateGrottoAction, null);

  if (!loaded) return null;
  if (!viewer.user) return <p className="text-sm text-slate-500"><a href="/sign-in?next=/grottos" className="text-amber-300 hover:text-amber-200">Sign in</a> to rate this grotto.</p>;

  if (state?.success) return <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Thanks! Your rating is posted.</p>;

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-amber-300 hover:text-amber-200">Rate {grottoName}</button>;
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4" noValidate>
      <input type="hidden" name="grottoId" value={grottoId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <StarInput value={rating} onChange={setRating} />
      {fieldError(state, "rating") && <p className="text-xs text-rose-400">{fieldError(state, "rating")}</p>}
      <Field label="Your rating" name={`body-${grottoId}`} error={fieldError(state, "body")}>
        <textarea id={`body-${grottoId}`} name="body" rows={3} maxLength={1000} required defaultValue={fieldValue(state, "body")} className={inputClass} placeholder="What is this grotto like to cave with?" />
      </Field>
      <FormError state={state} />
      <SubmitButton pending={pending}>Post rating</SubmitButton>
    </form>
  );
}
