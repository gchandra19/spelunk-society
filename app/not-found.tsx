import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">This passage is a dead end</h1>
      <p className="mt-3 text-slate-400">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/events" className="mt-8 inline-block rounded-xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-300">Back to expeditions</Link>
    </main>
  );
}
