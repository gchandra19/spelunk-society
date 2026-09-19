"use client";

import Link from "next/link";
import { CalendarX } from "lucide-react";
import { EventCard } from "@/components/domain/EventCard";
import { useViewer } from "@/components/providers/ViewerProvider";
import type { CavingEvent } from "@/types/domain";

const Grid = ({ events }: { events: readonly CavingEvent[] }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {events.map((e) => <EventCard key={e.id} event={e} />)}
  </div>
);

export function MyExpeditions({ events }: { readonly events: readonly CavingEvent[] }) {
  const { viewer, loaded } = useViewer();

  if (!loaded) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
        {[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-slate-900" />)}
      </div>
    );
  }

  if (!viewer.user) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 p-14 text-center">
        <p className="text-lg font-medium">Sign in to see your expeditions</p>
        <Link href="/sign-in?next=/my-expeditions" className="mt-6 inline-block rounded-xl bg-amber-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-amber-300">Sign in</Link>
      </div>
    );
  }

  const going = events.filter((e) => viewer.rsvpIds.includes(e.id));
  const hosting = events.filter((e) => viewer.hostedIds.includes(e.id));

  if (going.length === 0 && hosting.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 p-14 text-center">
        <CalendarX size={36} className="mx-auto text-slate-500" aria-hidden />
        <p className="mt-4 text-lg font-medium">Nothing here yet</p>
        <p className="mt-1 text-slate-400">RSVP to an expedition or host your own.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/events" className="rounded-xl bg-amber-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-amber-300">Browse expeditions</Link>
          <Link href="/events/new" className="rounded-xl border border-slate-600 px-5 py-2.5 font-semibold hover:bg-slate-800">Host one</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {going.length > 0 && <section aria-labelledby="going"><h2 id="going" className="mb-5 font-display text-2xl font-semibold">You&apos;re going</h2><Grid events={going} /></section>}
      {hosting.length > 0 && <section aria-labelledby="hosting"><h2 id="hosting" className="mb-5 font-display text-2xl font-semibold">You&apos;re hosting</h2><Grid events={hosting} /></section>}
    </div>
  );
}
