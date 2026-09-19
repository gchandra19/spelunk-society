import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { EventCard } from "@/components/domain/EventCard";
import { HeroActions } from "@/components/layout/HeroActions";
import { DIFFICULTY_META } from "@/lib/data/difficulty";
import { countMembers, listUpcomingEvents } from "@/lib/services/events";
import { formatShortDate } from "@/lib/format";
import { Difficulty } from "@/types/domain";

export const revalidate = 60;

export default async function HomePage() {
  const [upcoming, members] = await Promise.all([listUpcomingEvents(), countMembers()]);
  const next = upcoming[0];

  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <Image src="/images/hero-squeeze.jpg" alt="A caver in a red helmet squeezing through a narrow passage" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="mx-auto max-w-6xl px-6 py-28 sm:py-40">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">Fall 2026 season</p>
          <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">Descend with people who know the way.</h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Join expeditions, host your own, and share what you found. Workshops, wild caving trips and rescue drills led by experienced grotto members.
          </p>
          <HeroActions />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 sm:grid-cols-3">
          {[
            { icon: CalendarDays, label: "Upcoming expeditions", value: String(upcoming.length) },
            { icon: Users, label: "Members", value: String(members) },
            { icon: CalendarDays, label: "Next expedition", value: next ? formatShortDate(next.eventDate) : "TBA" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 bg-slate-900 p-5">
              <Icon size={22} className="text-amber-400" aria-hidden />
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">{label}</dt>
                <dd className="text-lg font-semibold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <section className="mt-20" aria-labelledby="up-next">
          <div className="mb-8 flex items-end justify-between">
            <h2 id="up-next" className="font-display text-3xl font-semibold">Up next</h2>
            <Link href="/events" className="text-sm font-medium text-amber-300 hover:text-amber-200">View all &rarr;</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
              Nothing scheduled yet. <Link href="/events/new" className="text-amber-300 underline">Host the first expedition.</Link>
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.slice(0, 3).map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </section>

        <section className="mt-24" aria-labelledby="levels">
          <h2 id="levels" className="font-display text-3xl font-semibold">Find your level</h2>
          <p className="mt-2 max-w-xl text-slate-400">Every expedition is tagged so you know what you&apos;re signing up for.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Object.values(Difficulty).map((level) => (
              <div key={level} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${DIFFICULTY_META[level].badge}`}>{level}</span>
                <p className="mt-4 text-slate-300">{DIFFICULTY_META[level].summary}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
