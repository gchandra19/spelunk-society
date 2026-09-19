import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { DifficultyBadge } from "@/components/domain/DifficultyBadge";
import { RSVPControl } from "@/components/domain/RSVPControl";
import { formatDay, formatMonth, formatTime } from "@/lib/format";
import type { CavingEvent } from "@/types/domain";

export const eventState = (e: CavingEvent): "open" | "ended" | "cancelled" =>
  e.status === "cancelled" ? "cancelled" : Date.parse(e.eventDate) <= Date.now() ? "ended" : "open";

export function EventCard({ event }: { readonly event: CavingEvent }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-slate-600">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
        <Image
          src={event.image.src}
          alt={event.image.alt}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 rounded-xl bg-slate-950/80 px-3 py-1.5 text-center leading-none backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">{formatMonth(event.eventDate)}</p>
          <p className="mt-0.5 text-xl font-bold">{formatDay(event.eventDate)}</p>
        </div>
        <div className="absolute right-3 top-3"><DifficultyBadge difficulty={event.difficulty} /></div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug">
            <Link href={`/events/${event.id}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-amber-300 focus-visible:after:rounded-2xl">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">{event.description}</p>
        </div>

        <ul className="space-y-1 text-sm text-slate-300">
          <li className="flex items-center gap-2"><MapPin size={15} className="text-slate-500" aria-hidden />{event.caveName}</li>
          <li className="flex items-center gap-2"><Clock size={15} className="text-slate-500" aria-hidden />{formatTime(event.eventDate)} &middot; {event.durationHours}h</li>
        </ul>

        <div className="mt-auto pt-2">
          <RSVPControl eventId={event.id} rsvpCount={event.rsvpCount} capacity={event.capacity} state={eventState(event)} />
        </div>
      </div>
    </article>
  );
}
