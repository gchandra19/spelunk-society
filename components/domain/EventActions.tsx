"use client";

import { useState } from "react";
import { CalendarPlus, Check, Share2 } from "lucide-react";
import { buildICS } from "@/lib/calendar";
import type { CavingEvent } from "@/types/domain";

export function EventActions({ event }: { readonly event: CavingEvent }) {
  const [note, setNote] = useState<string | null>(null);

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(null), 2500);
  };

  const addToCalendar = () => {
    const blob = new Blob([buildICS(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text: event.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        flash("Link copied");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const btn = "flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

  return (
    <div>
      <div className="flex gap-2">
        <button type="button" onClick={addToCalendar} className={btn}><CalendarPlus size={16} aria-hidden />Add to calendar</button>
        <button type="button" onClick={share} className={btn}><Share2 size={16} aria-hidden />Share</button>
      </div>
      <p role="status" className="mt-2 h-5 text-center text-sm text-emerald-300">
        {note && <span className="inline-flex items-center gap-1"><Check size={14} aria-hidden />{note}</span>}
      </p>
    </div>
  );
}
