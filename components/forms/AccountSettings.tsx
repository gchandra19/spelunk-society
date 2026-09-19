"use client";

import { useActionState, useState } from "react";
import { MemberBadge, SKILL_LABELS } from "@/components/domain/MemberBadge";
import { RecoveryCodePanel } from "@/components/forms/RecoveryCodePanel";
import { regenerateRecoveryCodeAction, setSkillLevelAction, type CodeState, type FormState } from "@/lib/actions/auth";
import { Field, FormError, SubmitButton, fieldError, inputClass } from "@/components/forms/Field";
import type { Role, SkillLevel } from "@/types/domain";

interface Props {
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly skillLevel: SkillLevel;
  readonly clubName: string | null;
}

export function AccountSettings({ name, email, role, skillLevel, clubName }: Props) {
  const [levelState, levelAction, levelPending] = useActionState<FormState, FormData>(setSkillLevelAction, null);
  const [codeState, codeAction, codePending] = useActionState<CodeState, FormData>(regenerateRecoveryCodeAction, null);
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="space-y-10">
      <section aria-labelledby="profile" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 id="profile" className="font-display text-2xl font-semibold">Profile</h2>
        <p className="mt-3 flex flex-wrap items-center gap-2"><span className="font-medium">{name}</span><MemberBadge level={skillLevel} role={role} /></p>
        <p className="mt-1 text-sm text-slate-400">{email}</p>
        <p className="mt-1 text-sm text-slate-400">Club: {clubName ?? "none yet"}</p>

        <form action={levelAction} className="mt-6 max-w-sm space-y-3">
          <Field label="Caving experience" name="skillLevel" hint="Shown next to your posts.">
            <select id="skillLevel" name="skillLevel" defaultValue={skillLevel} className={inputClass}>
              {(Object.keys(SKILL_LABELS) as SkillLevel[]).map((l) => <option key={l} value={l}>{SKILL_LABELS[l]}</option>)}
            </select>
          </Field>
          <FormError state={levelState} />
          {levelState?.success && <p role="status" className="text-sm text-emerald-300">Saved.</p>}
          <SubmitButton pending={levelPending}>Save level</SubmitButton>
        </form>
        {role === "expert" && <p className="mt-4 text-sm text-violet-300">Your account is a verified expert. That badge is granted by the site admins.</p>}
      </section>

      <section aria-labelledby="recovery" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 id="recovery" className="font-display text-2xl font-semibold">Recovery code</h2>
        <p className="mt-2 text-sm text-slate-400">
          Your recovery code lets you reset a forgotten password. We can&apos;t email you, so keep it safe. Generating a new one makes the old one stop working.
        </p>

        {codeState?.success && codeState.recoveryCode && !dismissed ? (
          <div className="mt-5"><RecoveryCodePanel code={codeState.recoveryCode} continueLabel="Done" onContinue={() => setDismissed(true)} /></div>
        ) : (
          <form action={codeAction} className="mt-5 max-w-sm space-y-3" onSubmit={() => setDismissed(false)}>
            <Field label="Confirm your password" name="password" error={fieldError(codeState, "password")}>
              <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
            </Field>
            <FormError state={codeState} />
            <SubmitButton pending={codePending}>Generate a new recovery code</SubmitButton>
          </form>
        )}
      </section>
    </div>
  );
}
