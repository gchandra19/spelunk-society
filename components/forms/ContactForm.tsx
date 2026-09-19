"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { contactAction } from "@/lib/actions/contact";
import type { FormState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(contactAction, null);

  if (state?.success) {
    return (
      <div role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <CheckCircle2 size={36} className="mx-auto text-emerald-300" aria-hidden />
        <p className="mt-3 text-lg font-medium">Message sent</p>
        <p className="mt-1 text-slate-300">Thanks for getting in touch. We&apos;ll reply by email.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <Field label="Your name" name="name" error={fieldError(state, "name")}>
        <input id="name" name="name" autoComplete="name" required maxLength={80} defaultValue={fieldValue(state, "name")} className={inputClass} />
      </Field>
      <Field label="Email" name="email" error={fieldError(state, "email")}>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={fieldValue(state, "email")} className={inputClass} />
      </Field>
      <Field label="Message" name="message" error={fieldError(state, "message")}>
        <textarea id="message" name="message" rows={6} required maxLength={3000} defaultValue={fieldValue(state, "message")} className={inputClass} placeholder="Questions, feedback, or a grotto you'd like listed" />
      </Field>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <FormError state={state} />
      <SubmitButton pending={pending}>Send message</SubmitButton>
    </form>
  );
}
