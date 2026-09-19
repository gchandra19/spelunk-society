import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, Star } from "lucide-react";
import { ExpertReviewStatus } from "@/components/domain/ExpertReviewStatus";
import { GEAR, GEAR_CATEGORIES, type GearCategory } from "@/lib/data/gear";
import { gearRatingStats } from "@/lib/services/gear";

export const metadata: Metadata = { title: "Gear guides" };
export const revalidate = 300;

export default async function GearPage() {
  const stats = await gearRatingStats();
  const categories = Object.keys(GEAR_CATEGORIES) as GearCategory[];

  return (
    <main className="mx-auto max-w-6xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Gear guides</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        What to look for, what to avoid, and how to spend wisely, plus reviews from members. Advice is general and worldwide: check the standards and rules in your own country.
      </p>

      <p className="mt-6 flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-400" aria-hidden />
        <span>
          <strong>New to caving?</strong> You usually don&apos;t need to buy anything for your first trips: clubs lend helmets and lights. Life-safety gear (marked below) should be bought new and learned from a qualified instructor. Guides marked &ldquo;Awaiting expert review&rdquo; haven&apos;t been checked by an instructor yet.
        </span>
      </p>

      {categories.map((c) => (
        <section key={c} className="mt-14" aria-labelledby={`cat-${c}`}>
          <h2 id={`cat-${c}`} className="font-display text-2xl font-semibold">{GEAR_CATEGORIES[c].label}</h2>
          <p className="mt-1 text-slate-400">{GEAR_CATEGORIES[c].blurb}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GEAR.filter((g) => g.category === c).map((g) => {
              const s = stats[g.slug];
              return (
                <article key={g.slug} className="relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-600">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">
                      <Link href={`/gear/${g.slug}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-amber-300">{g.name}</Link>
                    </h3>
                    {g.lifeSafety && <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300 ring-1 ring-rose-500/30">Life safety</span>}
                  </div>
                  <p className="mt-2 flex-1 text-sm text-slate-400">{g.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {s ? <span className="flex items-center gap-1 text-sm"><Star size={14} className="fill-amber-400 text-amber-400" aria-hidden /><b>{s.average.toFixed(1)}</b><span className="text-slate-500">({s.count})</span></span> : <span className="text-xs text-slate-500">No reviews yet</span>}
                    <span className="ml-auto"><ExpertReviewStatus review={g.review} /></span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
