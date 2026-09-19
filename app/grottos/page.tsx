import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Users } from "lucide-react";
import { ClubMembershipButton } from "@/components/domain/ClubMembershipButton";
import { listGrottos } from "@/lib/services/grottos";

export const metadata: Metadata = { title: "Clubs and grottos" };
export const revalidate = 300;

export default async function ClubsPage() {
  const clubs = await listGrottos();

  return (
    <main className="mx-auto max-w-6xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Clubs &amp; grottos</h1>
      <p className="mt-2 max-w-2xl text-slate-400">Local caving clubs around the world. Join one to meet people, borrow gear and get on their trips. You can belong to one club at a time.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((g) => (
          <article key={g.id} className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-slate-600">
            <div className="relative aspect-[16/9]">
              <Image src={g.image.src} alt={g.image.alt} fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-display text-2xl font-semibold">
                <Link href={`/grottos/${g.id}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-amber-300">{g.name}</Link>
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                <li className="flex items-center gap-2"><MapPin size={15} className="text-slate-500" aria-hidden />{g.region}</li>
                <li className="flex items-center gap-2"><Users size={15} className="text-slate-500" aria-hidden />{g.memberCount} member{g.memberCount === 1 ? "" : "s"}</li>
                <li className="flex items-center gap-2"><Star size={15} className={g.ratingAverage === null ? "text-slate-600" : "fill-amber-400 text-amber-400"} aria-hidden />
                  {g.ratingAverage === null ? "No ratings yet" : <><b>{g.ratingAverage.toFixed(1)}</b><span className="text-slate-500">({g.ratingCount})</span></>}
                </li>
              </ul>
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-400">{g.description}</p>
              <div className="relative z-10 mt-5"><ClubMembershipButton clubId={g.id} clubName={g.name} /></div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
