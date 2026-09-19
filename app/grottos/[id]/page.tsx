import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, Users } from "lucide-react";
import { ClubMembershipButton } from "@/components/domain/ClubMembershipButton";
import { EventCard } from "@/components/domain/EventCard";
import { MemberBadge } from "@/components/domain/MemberBadge";
import { ReviewList } from "@/components/domain/ReviewList";
import { GrottoRatingForm } from "@/components/forms/GrottoRatingForm";
import { listEventsForGrotto } from "@/lib/services/events";
import { getGrotto, listGrottoMembers, listGrottoReviews } from "@/lib/services/grottos";

type Params = Promise<{ id: string }>;

export const revalidate = 120;
export const generateStaticParams = async () => [];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const g = await getGrotto((await params).id);
  return g ? { title: g.name, description: g.description } : {};
}

export default async function ClubPage({ params }: { params: Params }) {
  const { id } = await params;
  const club = await getGrotto(id);
  if (!club) notFound();

  const [members, reviews, events] = await Promise.all([listGrottoMembers(id), listGrottoReviews(id, 50), listEventsForGrotto(id)]);
  const now = Date.now();
  const upcoming = events.filter((e) => Date.parse(e.eventDate) >= now).reverse();
  const past = events.filter((e) => Date.parse(e.eventDate) < now);

  return (
    <main>
      <div className="relative h-64 sm:h-80">
        <Image src={club.image.src} alt={club.image.alt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30" />
      </div>

      <div className="relative mx-auto -mt-20 max-w-5xl px-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-slate-400"><Link href="/grottos" className="hover:text-white">Clubs</Link> <span aria-hidden>/</span></nav>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{club.name}</h1>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
          <li className="flex items-center gap-2"><MapPin size={16} className="text-slate-500" aria-hidden />{club.region}</li>
          <li className="flex items-center gap-2"><Users size={16} className="text-slate-500" aria-hidden />{club.memberCount} member{club.memberCount === 1 ? "" : "s"}</li>
          <li className="flex items-center gap-2"><CalendarClock size={16} className="text-slate-500" aria-hidden />{club.meets}</li>
        </ul>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">{club.description}</p>
        <div className="mt-6"><ClubMembershipButton clubId={club.id} clubName={club.name} /></div>

        <section className="mt-14" aria-labelledby="members">
          <h2 id="members" className="font-display text-2xl font-semibold">Members</h2>
          {members.length === 0 ? <p className="mt-3 text-slate-400">No members yet. Be the first.</p> : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <span className="truncate font-medium">{m.name}</span><MemberBadge level={m.skillLevel} role={m.role} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {upcoming.length > 0 && (
          <section className="mt-14" aria-labelledby="upcoming"><h2 id="upcoming" className="mb-6 font-display text-2xl font-semibold">Upcoming expeditions</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div></section>
        )}
        {past.length > 0 && (
          <section className="mt-14" aria-labelledby="past"><h2 id="past" className="mb-6 font-display text-2xl font-semibold">Past expeditions</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{past.slice(0, 6).map((e) => <EventCard key={e.id} event={e} />)}</div></section>
        )}

        <section className="mt-14" aria-labelledby="ratings">
          <h2 id="ratings" className="mb-5 font-display text-2xl font-semibold">Ratings</h2>
          <ReviewList reviews={reviews} />
          <div className="mt-6 max-w-lg"><GrottoRatingForm grottoId={club.id} grottoName={club.name} /></div>
        </section>
      </div>
    </main>
  );
}
