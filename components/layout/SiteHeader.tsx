"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Mountain, X } from "lucide-react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { signOutAction } from "@/lib/actions/auth";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Expeditions" },
  { href: "/grottos", label: "Grottos" },
  { href: "/my-expeditions", label: "My Expeditions" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { viewer, loaded, refresh } = useViewer();
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const count = viewer.rsvpIds.length;

  const linkClass = (href: string) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive(href) ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`;

  const badge = (href: string) =>
    href === "/my-expeditions" && count > 0 ? (
      <span className="rounded-full bg-amber-400 px-1.5 text-xs font-bold text-slate-950" aria-label={`${count} RSVPs`}>{count}</span>
    ) : null;

  const signOut = () =>
    startSignOut(async () => {
      await signOutAction();
      await refresh();
      router.push("/");
      router.refresh();
    });

  const authArea = (mobile: boolean) => {
    if (!loaded) return <span className="h-9 w-24" aria-hidden />;
    if (viewer.user) {
      return (
        <div className={`flex items-center gap-2 ${mobile ? "flex-col items-stretch" : ""}`}>
          <Link href="/events/new" className="rounded-lg bg-amber-400 px-3.5 py-2 text-center text-sm font-semibold text-slate-950 hover:bg-amber-300">Host an expedition</Link>
          <button type="button" onClick={signOut} disabled={signingOut} className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white" title={`Signed in as ${viewer.user.name}`}>
            <LogOut size={15} aria-hidden />Sign out
          </button>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-2 ${mobile ? "flex-col items-stretch" : ""}`}>
        <Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} className="rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-300 hover:text-white">Sign in</Link>
        <Link href="/sign-up" className="rounded-lg bg-amber-400 px-3.5 py-2 text-center text-sm font-semibold text-slate-950 hover:bg-amber-300">Join</Link>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <Mountain size={22} className="text-amber-400" aria-hidden />
          <span className="hidden sm:inline">The Spelunkers Society</span>
          <span className="sm:hidden">Spelunkers</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label }) => (
            <li key={href}><Link href={href} aria-current={isActive(href) ? "page" : undefined} className={linkClass(href)}>{label}{badge(href)}</Link></li>
          ))}
        </ul>

        <div className="hidden md:block">{authArea(false)}</div>

        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="space-y-3 border-t border-slate-800 px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {LINKS.map(({ href, label }) => (
              <li key={href}><Link href={href} aria-current={isActive(href) ? "page" : undefined} className={`${linkClass(href)} py-3 text-base`}>{label}{badge(href)}</Link></li>
            ))}
          </ul>
          {authArea(true)}
        </div>
      )}
    </header>
  );
}
