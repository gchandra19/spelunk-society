"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewer } from "@/components/providers/ViewerProvider";
import { reviewGearAction } from "@/lib/actions/gear";
import type { FormState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";
import { StarInput } from "@/components/forms/StarInput";

export function GearReviewForm({ slug, name }: { readonly slug: string; readonly name: string }) {
  const { viewer, loaded } = useViewer();
  const pathname = usePathname();
  const [rating, setRating] = useState(0);
  const [state, action, pending] = useActionState<FormState, FormData>(reviewGearAction, null);

  if (!loaded) return null;
  if (!viewer.user) return <p className="text-slate-400"><Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} className="text-amber-300 hover:text-amber-200">Sign in</Link> to share your experience with this gear.</p>;
  if (state?.success) return <p role="status" className="rounded-lg bg-emerald-500/10 px-4 py-3 text-emerald-300">Thanks! Your review is posted.</p>;

  return (
    <form action={action} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6" noValidate>
      <h3 className="font-display text-xl font-semibold">Review {name.toLowerCase()}</h3>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating || ""} />
      <div className="mt-4"><StarInput value={rating} onChange={setRating} /></div>
      {fieldError(state, "rating") && <p className="mt-1 text-xs text-rose-400">{fieldError(state, "rating")}</p>}
      <div className="mt-4">
        <Field label="Your experience" name="body" error={fieldError(state, "body")}>
          <textarea id="body" name="body" rows={4} maxLength={1500} required defaultValue={fieldValue(state, "body")} className={inputClass} placeholder="What did you use it for, and how did it hold up?" />
        </Field>
      </div>
      <div className="mt-4 space-y-3"><FormError state={state} /><SubmitButton pending={pending}>Post review</SubmitButton></div>
    </form>
  );
}
