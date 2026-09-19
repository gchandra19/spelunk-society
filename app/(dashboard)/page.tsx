import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { EventCard } from "@/components/domain/EventCard";
import { RecentReviews } from "@/components/domain/RecentReviews";
import { HeroActions } from "@/components/layout/HeroActions";
import { DIFFICULTY_META } from "@/lib/data/difficulty";
import { countMembers, listPastEvents, listUpcomingEvents } from "@/lib/services/events";
import { listRecentReviews } from "@/lib/services/reviews";
import { listQuestions } from "@/lib/services/qa";
import { QuestionCard } from "@/components/domain/QuestionCard";
import { GEAR_CATEGORIES, type GearCategory } from "@/lib/data/gear";
import { formatShortDate } from "@/lib/format";
import { Difficulty } from "@/types/domain";

export const revalidate = 60;

export default async function HomePage() {
  const [upcoming, members, past, recentReviews, questions] = await Promise.all([listUpcomingEvents(), countMembers(), listPastEvents(3), listRecentReviews(6), listQuestions(3)]);
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

        {past.length > 0 && (
          <section className="mt-24" aria-labelledby="recent">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 id="recent" className="font-display text-3xl font-semibold">Recently completed</h2>
                <p className="mt-2 text-slate-400">See how past expeditions went. No account needed.</p>
              </div>
              <Link href="/events#past" className="text-sm font-medium text-amber-300 hover:text-amber-200">All past expeditions &rarr;</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        {recentReviews.length > 0 && (
          <section className="mt-24" aria-labelledby="reviews">
            <h2 id="reviews" className="font-display text-3xl font-semibold">What members say</h2>
            <p className="mb-8 mt-2 text-slate-400">Honest reviews from people who joined.</p>
            <RecentReviews reviews={recentReviews} />
          </section>
        )}

        <section className="mt-24" aria-labelledby="qa">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 id="qa" className="font-display text-3xl font-semibold">Ask the community</h2>
              <p className="mt-2 text-slate-400">Real questions from cavers, answered by people with experience. Readable by everyone.</p>
            </div>
            <Link href="/questions" className="text-sm font-medium text-amber-300 hover:text-amber-200">All questions &rarr;</Link>
          </div>
          <div className="space-y-4">{questions.map((q) => <QuestionCard key={q.id} question={q} />)}</div>
        </section>

        <section className="mt-24" aria-labelledby="gear">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 id="gear" className="font-display text-3xl font-semibold">Know your gear</h2>
              <p className="mt-2 text-slate-400">What to look for, what to avoid, and where to get it, with member reviews.</p>
            </div>
            <Link href="/gear" className="text-sm font-medium text-amber-300 hover:text-amber-200">All gear guides &rarr;</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(GEAR_CATEGORIES) as GearCategory[]).map((c) => (
              <Link key={c} href={`/gear#cat-${c}`} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-600">
                <p className="font-display text-lg font-semibold">{GEAR_CATEGORIES[c].label}</p>
                <p className="mt-1 text-sm text-slate-400">{GEAR_CATEGORIES[c].blurb}</p>
              </Link>
            ))}
          </div>
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
