"use client";

import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { voteAction } from "@/lib/actions/qa";

interface Props {
  readonly type: "question" | "answer";
  readonly targetId: string;
  readonly questionId: string;
  readonly authorId: string;
  readonly score: number;
}

export function VoteButton({ type, targetId, questionId, authorId, score }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { viewer, applyVote } = useViewer();
  const key = `${type}:${targetId}`;
  const voted = viewer.voteKeys.includes(key);
  const [serverScore, setServerScore] = useState(score);
  const [optimistic, flip] = useOptimistic({ voted, score: serverScore }, (s) => ({ voted: !s.voted, score: s.score + (s.voted ? -1 : 1) }));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isOwn = viewer.user?.id === authorId;

  const click = () => {
    setError(null);
    if (!viewer.user) return router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
    startTransition(async () => {
      flip(undefined);
      const result = await voteAction(type, targetId, questionId);
      if (result.success) {
        applyVote(key, result.voted);
        setServerScore(result.score);
      } else setError(result.error);
    });
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={click}
        disabled={pending || isOwn}
        aria-pressed={optimistic.voted}
        aria-label={isOwn ? "You can't mark your own post as helpful" : optimistic.voted ? "Remove helpful mark" : "Mark as helpful"}
        title={isOwn ? "You can't mark your own post as helpful" : "Helpful"}
        className={`rounded-lg p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed ${
          optimistic.voted ? "bg-amber-400/20 text-amber-300" : "text-slate-400 hover:bg-slate-800 hover:text-white disabled:hover:bg-transparent disabled:hover:text-slate-400"
        }`}
      >
        <ThumbsUp size={18} className={optimistic.voted ? "fill-amber-400/30" : ""} aria-hidden />
      </button>
      <span className="text-sm font-semibold" aria-live="polite">{optimistic.score}</span>
      {error && <span role="alert" className="max-w-[6rem] text-center text-[10px] text-rose-400">{error}</span>}
    </div>
  );
}
