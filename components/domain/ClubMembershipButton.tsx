"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, UserPlus } from "lucide-react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { setClubAction } from "@/lib/actions/auth";

export function ClubMembershipButton({ clubId, clubName }: { readonly clubId: string; readonly clubName: string }) {
  const { viewer, loaded, refresh } = useViewer();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!loaded) return <span className="block h-10" aria-hidden />;
  const isMember = viewer.grottoId === clubId;

  const click = () => {
    setError(null);
    if (!viewer.user) return router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
    startTransition(async () => {
      const result = await setClubAction(isMember ? "" : clubId);
      if (result.success) {
        await refresh();
        router.refresh();
      } else setError(result.error);
    });
  };

  return (
    <div>
      <button type="button" onClick={click} disabled={pending} aria-pressed={isMember}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60 ${
          isMember ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25" : "bg-amber-400 text-slate-950 hover:bg-amber-300"}`}>
        {isMember ? <><Check size={16} aria-hidden />Member &middot; leave</> : <><UserPlus size={16} aria-hidden />{viewer.user ? `Join ${clubName}` : "Sign in to join"}</>}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}
