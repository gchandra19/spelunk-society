import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { ExpertReviewStatus } from "@/components/domain/ExpertReviewStatus";
import { ReviewList } from "@/components/domain/ReviewList";
import { GearReviewForm } from "@/components/forms/GearReviewForm";
import { GEAR, GEAR_CATEGORIES, WHERE_TO_BUY, gearBySlug } from "@/lib/data/gear";
import { listGearReviews } from "@/lib/services/gear";

type Params = Promise<{ slug: string }>;

export const revalidate = 300;
export const generateStaticParams = () => GEAR.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const g = gearBySlug((await params).slug);
  return g ? { title: `${g.name} guide`, description: g.summary } : {};
}

export default async function GearItemPage({ params }: { params: Params }) {
  const { slug } = await params;
  const g = gearBySlug(slug);
  if (!g) notFound();
  const reviews = await listGearReviews(slug);

  return (
    <main className="mx-auto max-w-3xl px-6 pt-14">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400">
        <Link href="/gear" className="hover:text-white">Gear</Link> <span aria-hidden>/</span> {GEAR_CATEGORIES[g.category].label}
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        {g.lifeSafety && <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 ring-1 ring-rose-500/30">Life safety</span>}
        <ExpertReviewStatus review={g.review} />
      </div>
      <h1 className="mt-4 font-display text-4xl font-semibold">{g.name}</h1>
      <p className="mt-3 text-lg text-slate-300">{g.summary}</p>

      {g.lifeSafety && (
        <p className="mt-6 flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-100">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-rose-300" aria-hidden />
          <span>Your life depends on this equipment. Buy it new from a reputable supplier, learn to use it from a qualified instructor, and follow the manufacturer&apos;s instructions.</span>
        </p>
      )}

      <section className="mt-10" aria-labelledby="look"><h2 id="look" className="font-display text-2xl font-semibold">What to look for</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-300">{g.lookFor.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      {g.standards && <section className="mt-8"><h2 className="font-display text-2xl font-semibold">Standards</h2><p className="mt-2 text-slate-300">{g.standards} Always confirm the current standard and rating with the manufacturer.</p></section>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="font-semibold">What to avoid</h2><p className="mt-2 text-sm text-slate-300">{g.avoid}</p></section>
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="font-semibold">Budget advice</h2><p className="mt-2 text-sm text-slate-300">{g.budget}</p></section>
      </div>

      <section className="mt-8"><h2 className="font-display text-2xl font-semibold">Where to get it</h2><p className="mt-2 text-slate-300">{WHERE_TO_BUY}</p></section>

      <section className="mt-14" aria-labelledby="reviews">
        <h2 id="reviews" className="mb-5 font-display text-2xl font-semibold">Member reviews</h2>
        <ReviewList reviews={reviews} />
        <div className="mt-8"><GearReviewForm slug={g.slug} name={g.name} /></div>
      </section>
    </main>
  );
}
