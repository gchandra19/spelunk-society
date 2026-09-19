"use client";

import { useActionState } from "react";
import Link from "next/link";
import { RecoveryCodePanel } from "@/components/forms/RecoveryCodePanel";
import { recoverPasswordAction, type CodeState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<CodeState, FormData>(recoverPasswordAction, null);

  if (state?.success && state.recoveryCode) {
    return (
      <div className="space-y-5">
        <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Your password has been changed and other sessions were signed out.</p>
        <RecoveryCodePanel code={state.recoveryCode} continueLabel="Go to sign in" onContinue={() => { window.location.href = "/sign-in"; }} />
        <p className="text-sm text-slate-400">Your old recovery code no longer works. This new one replaces it.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <Field label="Email" name="email" error={fieldError(state, "email")}>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={fieldValue(state, "email")} className={inputClass} />
      </Field>
      <Field label="Recovery code" name="code" error={fieldError(state, "code")} hint="The 16-character code shown when you created your account, like ABCD-EFGH-JKLM-NPQR.">
        <input id="code" name="code" autoComplete="off" required maxLength={40} className={`${inputClass} font-mono uppercase`} />
      </Field>
      <Field label="New password" name="password" error={fieldError(state, "password")} hint="At least 10 characters.">
        <input id="password" name="password" type="password" autoComplete="new-password" required maxLength={72} className={inputClass} />
      </Field>
      <FormError state={state} />
      <SubmitButton pending={pending}>Reset password</SubmitButton>
      <p className="text-center text-sm text-slate-400">
        Lost your recovery code too? <Link href="/contact" className="text-amber-300 hover:text-amber-200">Contact us</Link>.
      </p>
    </form>
  );
}
