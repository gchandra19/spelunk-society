import Link from "next/link";
import { CheckCircle2, MessageSquare, ThumbsUp } from "lucide-react";
import { MemberBadge } from "@/components/domain/MemberBadge";
import { formatShortDate } from "@/lib/format";
import type { Question } from "@/types/domain";

export function QuestionCard({ question: q }: { readonly question: Question }) {
  const solved = q.acceptedAnswerId !== null;
  return (
    <article className="relative flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-600">
      <div className="hidden w-16 shrink-0 flex-col items-center gap-2 text-sm sm:flex">
        <span className="flex items-center gap-1 text-slate-300"><ThumbsUp size={14} aria-hidden />{q.score}</span>
        <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 ${solved ? "bg-emerald-500/15 text-emerald-300" : q.answerCount ? "text-amber-300" : "text-slate-500"}`}>
          {solved ? <CheckCircle2 size={14} aria-hidden /> : <MessageSquare size={14} aria-hidden />}{q.answerCount}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link href={`/questions/${q.id}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-amber-300">{q.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-400">{q.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {q.tags.map((t) => <span key={t} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{t}</span>)}
          <span className="ml-auto flex flex-wrap items-center gap-2 text-slate-400">
            {q.authorName} <MemberBadge level={q.authorLevel} role={q.authorRole} />
            <time dateTime={q.createdAt} className="text-xs text-slate-500">{formatShortDate(q.createdAt)}</time>
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 sm:hidden">{q.answerCount} answer{q.answerCount === 1 ? "" : "s"} &middot; {q.score} helpful{solved && " · solved"}</p>
      </div>
    </article>
  );
}
