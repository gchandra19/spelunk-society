"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { acceptAnswerAction } from "@/lib/actions/qa";

interface Props {
  readonly questionId: string;
  readonly answerId: string;
  readonly questionAuthorId: string;
  readonly accepted: boolean;
}

/** The asker marks the answer that solved their problem. Everyone else just sees the tick. */
export function AcceptButton({ questionId, answerId, questionAuthorId, accepted }: Props) {
  const { viewer } = useViewer();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (viewer.user?.id !== questionAuthorId) {
    return accepted ? <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300"><CheckCircle2 size={16} aria-hidden />Accepted answer</span> : null;
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        aria-pressed={accepted}
        onClick={() => startTransition(async () => {
          setError(null);
          const result = await acceptAnswerAction(questionId, answerId);
          if (result.success) router.refresh();
          else setError(result.error);
        })}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
          accepted ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40" : "border border-slate-700 text-slate-300 hover:bg-slate-800"
        }`}
      >
        <CheckCircle2 size={16} aria-hidden />{accepted ? "Accepted (click to undo)" : "Accept this answer"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
