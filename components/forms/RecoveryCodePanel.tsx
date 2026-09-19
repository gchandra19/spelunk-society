"use client";

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";

interface Props {
  readonly code: string;
  readonly continueLabel: string;
  readonly onContinue: () => void;
}

/** Shows a one-time recovery code and won't let you continue until you confirm you've saved it. */
export function RecoveryCodePanel({ code, continueLabel, onContinue }: Props) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the code is visible to copy by hand */
    }
  };

  return (
    <div className="rounded-2xl border border-amber-400/40 bg-amber-400/5 p-6" role="region" aria-label="Your recovery code">
      <p className="flex items-center gap-2 font-display text-xl font-semibold"><KeyRound size={20} className="text-amber-400" aria-hidden />Save your recovery code</p>
      <p className="mt-2 text-sm text-slate-300">
        If you forget your password, this code is the only way back into your account. We can&apos;t email you a reset link, and we won&apos;t show this code again.
      </p>
      <p className="mt-4 select-all rounded-xl bg-slate-950 px-4 py-3 text-center font-mono text-lg tracking-wider text-amber-300" data-testid="recovery-code">{code}</p>
      <button type="button" onClick={copy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800">
        {copied ? <><Check size={16} aria-hidden />Copied</> : <><Copy size={16} aria-hidden />Copy code</>}
      </button>
      <label className="mt-4 flex items-start gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1" />
        I&apos;ve saved this code somewhere safe, such as a password manager.
      </label>
      <button type="button" onClick={onContinue} disabled={!saved} className="mt-4 w-full rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
        {continueLabel}
      </button>
    </div>
  );
}
