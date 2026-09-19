"use client";

import { useActionState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewer } from "@/components/providers/ViewerProvider";
import { answerQuestionAction } from "@/lib/actions/qa";
import type { ActionResult } from "@/types/domain";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";

export function AnswerForm({ questionId }: { readonly questionId: string }) {
  const { viewer, loaded } = useViewer();
  const pathname = usePathname();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(answerQuestionAction, null);

  if (!loaded) return null;
  if (!viewer.user) {
    return <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-400"><Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} className="text-amber-300 hover:text-amber-200">Sign in</Link> to post an answer.</p>;
  }
  if (state?.success) return <p role="status" className="rounded-lg bg-emerald-500/10 px-4 py-3 text-emerald-300">Thanks, your answer is posted.</p>;

  return (
    <form action={action} className="space-y-4" noValidate>
      <h3 className="font-display text-xl font-semibold">Your answer</h3>
      <input type="hidden" name="questionId" value={questionId} />
      <Field label="Answer" name="body" error={fieldError(state, "body")} hint="Explain your reasoning and say where your experience comes from.">
        <textarea id="body" name="body" required rows={6} maxLength={5000} defaultValue={fieldValue(state, "body")} className={inputClass} />
      </Field>
      <FormError state={state} />
      <SubmitButton pending={pending}>Post answer</SubmitButton>
    </form>
  );
}
