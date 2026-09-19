"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useViewer } from "@/components/providers/ViewerProvider";

/** The home page is cached for everyone, so the sign-up call to action is decided in the browser. */
export function HeroActions() {
  const { viewer, loaded } = useViewer();

  return (
    <div className="mt-9 flex flex-wrap gap-3">
      <Link href="/events" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
        Browse expeditions <ArrowRight size={18} aria-hidden />
      </Link>
      {loaded && (viewer.user ? (
        <Link href="/events/new" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold transition hover:bg-slate-800/70">Host an expedition</Link>
      ) : (
        <Link href="/sign-up" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold transition hover:bg-slate-800/70">Become a member</Link>
      ))}
    </div>
  );
}
