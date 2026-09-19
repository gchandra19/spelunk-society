import type { Metadata } from "next";
import Image from "next/image";
import { CalendarClock, MapPin, Users } from "lucide-react";
import { listGrottos } from "@/lib/services/events";

export const metadata: Metadata = { title: "Grottos" };
export const revalidate = 300;

export default async function GrottosPage() {
  const grottos = await listGrottos();
  return (
    <main className="mx-auto max-w-6xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Grottos</h1>
      <p className="mt-2 max-w-xl text-slate-400">Local chapters that run the trips. Come to a meeting, borrow gear, find your team. Pick yours when you sign up.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {grottos.map((g) => (
          <article key={g.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="relative aspect-[16/9]">
              <Image src={g.image.src} alt={g.image.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl font-semibold">{g.name}</h2>
              <p className="mt-2 text-slate-400">{g.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><MapPin size={16} className="text-slate-500" aria-hidden />{g.region}</li>
                <li className="flex items-center gap-2"><Users size={16} className="text-slate-500" aria-hidden />{g.memberCount} member{g.memberCount === 1 ? "" : "s"}</li>
                <li className="flex items-center gap-2"><CalendarClock size={16} className="text-slate-500" aria-hidden />{g.meets}</li>
              </ul>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
