"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { askQuestionAction } from "@/lib/actions/qa";
import type { ActionResult } from "@/types/domain";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";

type State = ActionResult<{ id?: string }> | null;

export function AskForm() {
  const [state, action, pending] = useActionState<State, FormData>(askQuestionAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.id) router.push(`/questions/${state.id}`);
  }, [state, router]);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Field label="Title" name="title" error={fieldError(state, "title")} hint="Be specific: what are you trying to do, and what's stopping you?">
        <input id="title" name="title" required maxLength={150} defaultValue={fieldValue(state, "title")} className={inputClass} placeholder="e.g. How do I choose a descender for 10 mm rope?" />
      </Field>
      <Field label="Details" name="body" error={fieldError(state, "body")} hint="Include what you've tried, your experience level and the type of cave.">
        <textarea id="body" name="body" required rows={8} maxLength={5000} defaultValue={fieldValue(state, "body")} className={inputClass} />
      </Field>
      <Field label="Tags" name="tags" error={fieldError(state, "tags")} hint="Up to 5, separated by commas. For example: gear, srt, beginner.">
        <input id="tags" name="tags" maxLength={200} defaultValue={fieldValue(state, "tags")} className={inputClass} />
      </Field>
      <p className="rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
        Caving carries real risk. Answers here are community opinions, not instruction. Get hands-on training from a qualified instructor before relying on rope or safety advice.
      </p>
      <FormError state={state} />
      <SubmitButton pending={pending || Boolean(state?.success)}>Post question</SubmitButton>
    </form>
  );
}
