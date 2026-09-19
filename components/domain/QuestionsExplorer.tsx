"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { QuestionCard } from "@/components/domain/QuestionCard";
import type { Question } from "@/types/domain";

type Sort = "newest" | "top" | "unanswered";
const SORTS: readonly { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "top", label: "Most helpful" },
  { key: "unanswered", label: "Unanswered" },
];

export function QuestionsExplorer({ questions }: { readonly questions: readonly Question[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("newest");

  // /questions#srt opens with that tag selected
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) setTag(hash);
  }, []);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of questions) for (const t of q.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);
  }, [questions]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = questions.filter(
      (x) =>
        (!tag || x.tags.includes(tag)) &&
        (sort !== "unanswered" || x.answerCount === 0) &&
        (!q || `${x.title} ${x.body} ${x.tags.join(" ")}`.toLowerCase().includes(q)),
    );
    return sort === "top" ? [...list].sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt)) : list;
  }, [questions, query, tag, sort]);

  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${active ? "bg-amber-400 text-slate-950" : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"}`;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-6 mb-8 space-y-3 border-b border-slate-800/80 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <div className="flex gap-3">
          <label className="relative block flex-1">
            <span className="sr-only">Search questions</span>
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions, answers and tags"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:border-amber-400 focus:outline-none" />
          </label>
          <Link href="/questions/ask" className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-300"><Plus size={16} aria-hidden />Ask</Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 flex rounded-full bg-slate-800/80 p-0.5" role="tablist" aria-label="Sort">
            {SORTS.map((s) => (
              <button key={s.key} type="button" role="tab" aria-selected={sort === s.key} onClick={() => setSort(s.key)}
                className={`rounded-full px-3.5 py-1 text-sm font-medium transition ${sort === s.key ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}>{s.label}</button>
            ))}
          </div>
          {topTags.map((t) => <button key={t} type="button" onClick={() => setTag(tag === t ? null : t)} aria-pressed={tag === t} className={chip(tag === t)}>{t}</button>)}
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-400" aria-live="polite">{visible.length} question{visible.length === 1 ? "" : "s"}</p>
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          Nothing matches.{" "}
          <button type="button" onClick={() => { setQuery(""); setTag(null); setSort("newest"); }} className="text-amber-300 underline">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-4">{visible.map((q) => <QuestionCard key={q.id} question={q} />)}</div>
      )}
    </div>
  );
}
