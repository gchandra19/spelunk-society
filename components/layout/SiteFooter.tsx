import Link from "next/link";
import { Mountain } from "lucide-react";
import { PHOTO_CREDITS } from "@/lib/data/photos";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-slate-800">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold"><Mountain size={20} className="text-amber-400" aria-hidden />The Spelunkers Society</p>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Expeditions, questions and gear advice for cavers everywhere. Leave nothing but footprints, take nothing but photographs.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
            <li><Link href="/events" className="hover:text-white">Expeditions</Link></li>
            <li><Link href="/questions" className="hover:text-white">Q&amp;A</Link></li>
            <li><Link href="/gear" className="hover:text-white">Gear</Link></li>
            <li><Link href="/grottos" className="hover:text-white">Clubs</Link></li>
            <li><Link href="/my-expeditions" className="hover:text-white">My Expeditions</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><a href="https://github.com/gchandra19/spelunk-society" className="hover:text-white">Source on GitHub</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-300">Photo credits (via Wikimedia Commons)</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            {PHOTO_CREDITS.map((credit) => <li key={credit}>{credit}</li>)}
          </ul>
        </div>
      </div>
    </footer>
  );
}
