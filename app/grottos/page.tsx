import type { Metadata } from "next";
import Image from "next/image";
import { CalendarClock, MapPin, Star, Users } from "lucide-react";
import { GrottoRatingForm } from "@/components/forms/GrottoRatingForm";
import { formatShortDate } from "@/lib/format";
import { listGrottoReviews, listGrottos } from "@/lib/services/grottos";

export const metadata: Metadata = { title: "Grottos" };
export const revalidate = 300;

const Stars = ({ value }: { value: number }) => (
  <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-600"} />)}
  </span>
);

export default async function GrottosPage() {
  const grottos = await listGrottos();
  const reviews = await Promise.all(grottos.map((g) => listGrottoReviews(g.id, 3)));

  return (
    <main className="mx-auto max-w-6xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Grottos</h1>
      <p className="mt-2 max-w-xl text-slate-400">Local chapters that run the trips. Come to a meeting, borrow gear, find your team. Pick yours when you sign up.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {grottos.map((g, i) => (
          <article key={g.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="relative aspect-[16/9]">
              <Image src={g.image.src} alt={g.image.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-display text-2xl font-semibold">{g.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm">
                {g.ratingAverage === null ? (
                  <span className="text-slate-500">No ratings yet</span>
                ) : (
                  <>
                    <Stars value={g.ratingAverage} />
                    <span className="font-semibold">{g.ratingAverage.toFixed(1)}</span>
                    <span className="text-slate-500">&middot; {g.ratingCount} rating{g.ratingCount === 1 ? "" : "s"}</span>
                  </>
                )}
              </p>
              <p className="mt-3 text-slate-400">{g.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><MapPin size={16} className="text-slate-500" aria-hidden />{g.region}</li>
                <li className="flex items-center gap-2"><Users size={16} className="text-slate-500" aria-hidden />{g.memberCount} member{g.memberCount === 1 ? "" : "s"}</li>
                <li className="flex items-center gap-2"><CalendarClock size={16} className="text-slate-500" aria-hidden />{g.meets}</li>
              </ul>

              {reviews[i].length > 0 && (
                <ul className="mt-6 space-y-3 border-t border-slate-800 pt-5">
                  {reviews[i].map((r) => (
                    <li key={r.id} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2"><span className="font-medium">{r.authorName}</span><Stars value={r.rating} /></span>
                        <time dateTime={r.createdAt} className="text-xs text-slate-500">{formatShortDate(r.createdAt)}</time>
                      </div>
                      <p className="mt-1 text-slate-400">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-6"><GrottoRatingForm grottoId={g.id} grottoName={g.name} /></div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
