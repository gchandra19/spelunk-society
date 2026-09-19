import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Flag, MapPin } from "lucide-react";
import { CancelEventButton } from "@/components/domain/CancelEventButton";
import { DifficultyBadge } from "@/components/domain/DifficultyBadge";
import { eventState, EventCard } from "@/components/domain/EventCard";
import { EventActions } from "@/components/domain/EventActions";
import { RSVPControl } from "@/components/domain/RSVPControl";
import { ReviewList } from "@/components/domain/ReviewList";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { DIFFICULTY_META } from "@/lib/data/difficulty";
import { formatLongDate, formatTime } from "@/lib/format";
import { getEvent, listUpcomingEvents } from "@/lib/services/events";
import { listReviews } from "@/lib/services/reviews";

type Params = Promise<{ id: string }>;

export const revalidate = 60;
export const generateStaticParams = async () => [];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const event = await getEvent((await params).id);
  if (!event) return {};
  return { title: event.title, description: event.description, openGraph: { title: event.title, description: event.description, images: [event.image.src] } };
}

export default async function EventPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const [reviews, upcoming] = await Promise.all([listReviews(id), listUpcomingEvents()]);
  const state = eventState(event);
  const meta = DIFFICULTY_META[event.difficulty];
  const related = upcoming.filter((e) => e.id !== event.id && e.difficulty === event.difficulty).slice(0, 3);

  const facts = [
    { icon: CalendarDays, label: "Date", value: formatLongDate(event.eventDate) },
    { icon: Clock, label: "Time", value: `${formatTime(event.eventDate)} · ${event.durationHours} hours` },
    { icon: MapPin, label: "Cave", value: event.caveName },
    { icon: Flag, label: "Hosted by", value: event.hostedBy },
  ];

  return (
    <main>
      <div className="relative h-72 sm:h-96">
        <Image src={event.image.src} alt={event.image.alt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30" />
      </div>

      <div className="relative mx-auto -mt-24 max-w-6xl px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400">
          <Link href="/events" className="hover:text-white">Expeditions</Link> <span aria-hidden>/</span> <span className="text-slate-300">{event.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={event.difficulty} />
              {state === "cancelled" && <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-300">Cancelled</span>}
              {state === "ended" && <span className="rounded-full bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-300">Completed</span>}
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">{event.title}</h1>
            <p className="mt-4 whitespace-pre-line text-lg text-slate-300">{event.description}</p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <Icon size={20} className="mt-0.5 shrink-0 text-amber-400" aria-hidden />
                  <div><dt className="text-xs uppercase tracking-wider text-slate-400">{label}</dt><dd className="font-medium">{value}</dd></div>
                </div>
              ))}
            </dl>

            <section className="mt-10" aria-labelledby="level">
              <h2 id="level" className="font-display text-2xl font-semibold">What to expect</h2>
              <p className="mt-2 text-slate-300">{meta.summary}</p>
              <h3 className="mt-6 font-semibold">What to bring</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">{meta.bring.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>

            {(state === "ended" || reviews.length > 0) && (
              <section className="mt-14" aria-labelledby="reviews">
                <h2 id="reviews" className="mb-5 font-display text-2xl font-semibold">Reviews</h2>
                <ReviewList reviews={reviews} />
                {state === "ended" && <div className="mt-8"><ReviewForm eventId={event.id} /></div>}
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <RSVPControl eventId={event.id} rsvpCount={event.rsvpCount} capacity={event.capacity} state={state} variant="full" />
              <div className="mt-5 border-t border-slate-800 pt-5"><EventActions event={event} /></div>
              {state === "open" && <CancelEventButton eventId={event.id} />}
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related">
            <h2 id="related" className="mb-6 font-display text-2xl font-semibold">More {event.difficulty.toLowerCase()} expeditions</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((e) => <EventCard key={e.id} event={e} />)}</div>
          </section>
        )}
      </div>
    </main>
  );
}
