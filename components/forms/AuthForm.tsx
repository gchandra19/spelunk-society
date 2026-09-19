"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useViewer } from "@/components/providers/ViewerProvider";
import { signInAction, signUpAction, type FormState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";

interface AuthFormProps {
  readonly mode: "sign-in" | "sign-up";
  readonly next: string;
  readonly grottos?: readonly { id: string; name: string }[];
}

export function AuthForm({ mode, next, grottos = [] }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [state, action, pending] = useActionState<FormState, FormData>(isSignUp ? signUpAction : signInAction, null);
  const { refresh } = useViewer();
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      void refresh().then(() => {
        router.push(next);
        router.refresh();
      });
    }
  }, [state, refresh, router, next]);

  const other = isSignUp ? "/sign-in" : "/sign-up";

  return (
    <form action={action} className="space-y-5" noValidate>
      {isSignUp && (
        <Field label="Your name" name="name" error={fieldError(state, "name")}>
          <input id="name" name="name" defaultValue={fieldValue(state, "name")} autoComplete="name" required maxLength={60} className={inputClass} />
        </Field>
      )}
      <Field label="Email" name="email" error={fieldError(state, "email")}>
        <input id="email" name="email" type="email" defaultValue={fieldValue(state, "email")} autoComplete="email" required maxLength={254} className={inputClass} />
      </Field>
      <Field label="Password" name="password" error={fieldError(state, "password")} hint={isSignUp ? "At least 10 characters." : undefined}>
        <input id="password" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required maxLength={72} className={inputClass} />
      </Field>
      {isSignUp && grottos.length > 0 && (
        <Field label="Your grotto (optional)" name="grottoId">
          <select id="grottoId" name="grottoId" defaultValue={fieldValue(state, "grottoId") ?? ""} className={inputClass}>
            <option value="">No grotto yet</option>
            {grottos.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
      )}

      <FormError state={state} />
      <SubmitButton pending={pending || Boolean(state?.success)}>{isSignUp ? "Create account" : "Sign in"}</SubmitButton>

      <p className="text-center text-sm text-slate-400">
        {isSignUp ? "Already a member?" : "New here?"}{" "}
        <Link href={`${other}?next=${encodeURIComponent(next)}`} className="font-medium text-amber-300 hover:text-amber-200">
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
