import Link from "next/link";
import { Mountain } from "lucide-react";

const CREDITS = [
  ["Squeeze and passage photos", "U.S. National Park Service, public domain"],
  ["Rope descent photo", "Carlsbad Caverns NPS, public domain"],
  ["Rescue photo", "Staff Sgt. Theanne Herrmann, SD National Guard, public domain"],
  ["Grotto members photo", "Leitmotiv, CC BY-SA 4.0"],
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-slate-800">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold"><Mountain size={20} className="text-amber-400" aria-hidden />The Spelunkers Society</p>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Grotto calendar and expedition coordinator. Leave nothing but footprints, take nothing but photographs.
          </p>
          <ul className="mt-5 flex gap-5 text-sm text-slate-300">
            <li><Link href="/events" className="hover:text-white">Expeditions</Link></li>
            <li><Link href="/grottos" className="hover:text-white">Grottos</Link></li>
            <li><Link href="/my-expeditions" className="hover:text-white">My Expeditions</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-300">Photo credits (via Wikimedia Commons)</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            {CREDITS.map(([what, who]) => <li key={what}>{what}: {who}</li>)}
          </ul>
        </div>
      </div>
    </footer>
  );
}
