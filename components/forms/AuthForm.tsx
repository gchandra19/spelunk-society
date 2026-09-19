"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecoveryCodePanel } from "@/components/forms/RecoveryCodePanel";
import { SKILL_LABELS } from "@/components/domain/MemberBadge";
import { useViewer } from "@/components/providers/ViewerProvider";
import { signInAction, signUpAction, type CodeState } from "@/lib/actions/auth";
import { checkField } from "@/lib/field-rules";
import { Field, FormError, SubmitButton, fieldValue, inputClass } from "@/components/forms/Field";
import type { SkillLevel } from "@/types/domain";

interface AuthFormProps {
  readonly mode: "sign-in" | "sign-up";
  readonly next: string;
  readonly grottos?: readonly { id: string; name: string }[];
}

type Errors = Partial<Record<string, string>>;

export function AuthForm({ mode, next, grottos = [] }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [state, action, pending] = useActionState<CodeState, FormData>(isSignUp ? signUpAction : signInAction, null);
  const { refresh } = useViewer();
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const touched = useRef<Set<string>>(new Set());
  const fields = isSignUp ? ["name", "email", "password"] : ["email", "password"];

  const finish = () => {
    void refresh().then(() => {
      router.push(next);
      router.refresh();
    });
  };

  useEffect(() => {
    if (state?.success && !state.recoveryCode) finish();
    else if (state && !state.success && state.fieldErrors) setErrors((e) => ({ ...e, ...state.fieldErrors }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // After sign-up, the recovery code must be seen and acknowledged before continuing.
  if (state?.success && state.recoveryCode) {
    return <RecoveryCodePanel code={state.recoveryCode} continueLabel="Continue" onContinue={finish} />;
  }

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
    const found: Errors = {};
    for (const f of fields) found[f] = checkField(f, String(data.get(f) ?? ""), mode) ?? undefined;
    if (Object.values(found).some(Boolean)) {
      e.preventDefault();
      setErrors(found);
      fields.forEach((f) => touched.current.add(f));
      (e.currentTarget.elements.namedItem(fields.find((f) => found[f])!) as HTMLElement | null)?.focus();
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
      {isSignUp && (
        <>
          <Field label="Your caving experience" name="skillLevel" hint="Shown next to your posts. You can change it later.">
            <select id="skillLevel" name="skillLevel" defaultValue={fieldValue(state, "skillLevel") ?? "beginner"} className={inputClass}>
              {(Object.keys(SKILL_LABELS) as SkillLevel[]).map((l) => <option key={l} value={l}>{SKILL_LABELS[l]}</option>)}
            </select>
          </Field>
          {grottos.length > 0 && (
            <Field label="Your club (optional)" name="grottoId">
              <select id="grottoId" name="grottoId" defaultValue={fieldValue(state, "grottoId") ?? ""} className={inputClass}>
                <option value="">No club yet</option>
                {grottos.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
          )}
        </>
      )}

      <FormError state={state} />
      <SubmitButton pending={pending || Boolean(state?.success)}>{isSignUp ? "Create account" : "Sign in"}</SubmitButton>

      {!isSignUp && <p className="text-center text-sm"><Link href="/forgot-password" className="text-slate-400 hover:text-white">Forgot your password?</Link></p>}
      <p className="text-center text-sm text-slate-400">
        {isSignUp ? "Already a member?" : "New here?"}{" "}
        <Link href={`${other}?next=${encodeURIComponent(next)}`} className="font-medium text-amber-300 hover:text-amber-200">
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
