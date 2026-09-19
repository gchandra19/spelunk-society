"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useViewer } from "@/components/providers/ViewerProvider";
import { signInAction, signUpAction, type FormState } from "@/lib/actions/auth";
import { checkField } from "@/lib/field-rules";
import { Field, FormError, SubmitButton, fieldValue, inputClass } from "@/components/forms/Field";

interface AuthFormProps {
  readonly mode: "sign-in" | "sign-up";
  readonly next: string;
  readonly grottos?: readonly { id: string; name: string }[];
}

type Errors = Partial<Record<string, string>>;

export function AuthForm({ mode, next, grottos = [] }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [state, action, pending] = useActionState<FormState, FormData>(isSignUp ? signUpAction : signInAction, null);
  const { refresh } = useViewer();
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const touched = useRef<Set<string>>(new Set());
  const fields = isSignUp ? ["name", "email", "password"] : ["email", "password"];

  useEffect(() => {
    if (state?.success) {
      void refresh().then(() => {
        router.push(next);
        router.refresh();
      });
    } else if (state?.fieldErrors) {
      setErrors((e) => ({ ...e, ...state.fieldErrors }));
    }
  }, [state, refresh, router, next]);

  const validate = (name: string, value: string) => setErrors((e) => ({ ...e, [name]: checkField(name, value, mode) ?? undefined }));

  // Validate when a field loses focus, then keep re-checking on every keystroke so the message clears the moment it's fixed.
  const bind = (name: string) => ({
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      touched.current.add(name);
      validate(name, e.target.value);
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (touched.current.has(name) || errors[name]) validate(name, e.target.value);
    },
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    for (const f of fields) next[f] = checkField(f, String(data.get(f) ?? ""), mode) ?? undefined;
    if (Object.values(next).some(Boolean)) {
      e.preventDefault();
      setErrors(next);
      fields.forEach((f) => touched.current.add(f));
      (e.currentTarget.elements.namedItem(fields.find((f) => next[f])!) as HTMLElement | null)?.focus();
    }
  };

  const other = isSignUp ? "/sign-in" : "/sign-up";

  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      {isSignUp && (
        <Field label="Your name" name="name" error={errors.name}>
          <input id="name" name="name" defaultValue={fieldValue(state, "name")} autoComplete="name" required maxLength={60} className={inputClass} {...bind("name")} />
        </Field>
      )}
      <Field label="Email" name="email" error={errors.email}>
        <input id="email" name="email" type="email" defaultValue={fieldValue(state, "email")} autoComplete="email" required maxLength={254} className={inputClass} {...bind("email")} />
      </Field>
      <Field label="Password" name="password" error={errors.password} hint={isSignUp ? "At least 10 characters." : undefined}>
        <input id="password" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required maxLength={72} className={inputClass} {...bind("password")} />
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
