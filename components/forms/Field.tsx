import type { FormState } from "@/lib/actions/auth";

export const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";

export const fieldError = (state: FormState, name: string): string | undefined =>
  state && !state.success ? state.fieldErrors?.[name] : undefined;

export const fieldValue = (state: FormState, name: string): string | undefined =>
  state && !state.success ? state.values?.[name] : undefined;

export function Field({ label, name, error, hint, children }: {
  label: string; name: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-200">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p id={`${name}-error`} className="mt-1 text-xs text-rose-400" role="alert">{error}</p>}
    </div>
  );
}

export function FormError({ state }: { state: FormState }) {
  if (!state || state.success) return null;
  return <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>;
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
