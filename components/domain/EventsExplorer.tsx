"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { EventCard } from "@/components/domain/EventCard";
import { useViewer } from "@/components/providers/ViewerProvider";
import { Difficulty, type CavingEvent } from "@/types/domain";

type Filter = "All" | Difficulty;
const FILTERS: readonly Filter[] = ["All", Difficulty.Beginner, Difficulty.Vertical, Difficulty.Rescue];

interface Props {
  readonly upcoming: readonly CavingEvent[];
  readonly past: readonly CavingEvent[];
}

export function EventsExplorer({ upcoming, past }: Props) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [onlyMine, setOnlyMine] = useState(false);
  const { viewer } = useViewer();

  // /events#past opens the Past tab directly (kept out of the query string so the page stays cacheable).
  useEffect(() => {
    if (window.location.hash === "#past") setTab("past");
  }, []);

  const going = viewer.rsvpIds;

  const list = tab === "upcoming" ? upcoming : past;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (e) =>
        (filter === "All" || e.difficulty === filter) &&
        (!onlyMine || going.includes(e.id)) &&
        (!q || `${e.title} ${e.caveName} ${e.hostedBy} ${e.description}`.toLowerCase().includes(q)),
    );
  }, [list, query, filter, onlyMine, going]);

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
      active ? "bg-amber-400 text-slate-950" : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
    }`;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-6 mb-8 space-y-3 border-b border-slate-800/80 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <div className="flex gap-3">
          <label className="relative block flex-1">
            <span className="sr-only">Search expeditions</span>
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, cave or grotto"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </label>
          <Link href="/events/new" className="hidden items-center gap-1.5 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-300 sm:flex">
            <Plus size={16} aria-hidden />Host
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 flex rounded-full bg-slate-800/80 p-0.5" role="tablist" aria-label="When">
            {(["upcoming", "past"] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1 text-sm font-medium capitalize transition ${tab === t ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {t} <span className="opacity-60">({t === "upcoming" ? upcoming.length : past.length})</span>
              </button>
            ))}
          </div>
          {FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} className={chip(filter === f)}>{f}</button>
          ))}
          {viewer.user && (
            <>
              <span className="mx-1 hidden h-5 w-px bg-slate-700 sm:block" aria-hidden />
              <button type="button" onClick={() => setOnlyMine((v) => !v)} aria-pressed={onlyMine} className={chip(onlyMine)}>
                My RSVPs{going.length > 0 && ` (${going.length})`}
              </button>
            </>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-400" aria-live="polite">
        {visible.length} expedition{visible.length === 1 ? "" : "s"}
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          {list.length === 0 ? (tab === "upcoming" ? "No upcoming expeditions yet." : "No past expeditions yet.") : "Nothing matches those filters."}
          {list.length > 0 && (
            <button type="button" onClick={() => { setQuery(""); setFilter("All"); setOnlyMine(false); }} className="ml-2 text-amber-300 underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}
