"use client";

import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useViewer } from "@/components/providers/ViewerProvider";
import { toggleRSVP } from "@/lib/actions/events";

interface RSVPControlProps {
  readonly eventId: string;
  readonly rsvpCount: number;
  readonly capacity: number;
  readonly state?: "open" | "ended" | "cancelled";
  readonly variant?: "compact" | "full";
}

export function RSVPControl({ eventId, rsvpCount, capacity, state = "open", variant = "compact" }: RSVPControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { viewer, loaded, counts, applyRsvp } = useViewer();

  const going = viewer.rsvpIds.includes(eventId);
  const count = counts[eventId] ?? rsvpCount;
  const [optimistic, flip] = useOptimistic({ going, count }, (s) => ({ going: !s.going, count: s.count + (s.going ? -1 : 1) }));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const closed = state !== "open";
  const isFull = !optimistic.going && optimistic.count >= capacity;
  const spotsLeft = Math.max(capacity - optimistic.count, 0);
  const fill = Math.min((optimistic.count / capacity) * 100, 100);

  const handleClick = () => {
    setError(null);
    if (!viewer.user) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    startTransition(async () => {
      flip(undefined);
      try {
        const result = await toggleRSVP(eventId);
        if (result.success) applyRsvp(eventId, result.going, result.count);
        else setError(result.error);
      } catch {
        setError("Couldn't save your RSVP. Check your connection and try again.");
      }
    });
  };

  const label = closed
    ? state === "cancelled" ? "Cancelled" : "Expedition ended"
    : optimistic.going ? "You’re going · tap to cancel"
    : isFull ? "Fully booked"
    : viewer.user || !loaded ? "RSVP" : "Sign in to RSVP";

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-medium text-slate-200">{optimistic.count} going</span>
          <span className={spotsLeft <= 3 && !closed ? "text-amber-300" : "text-slate-400"}>
            {closed ? " " : isFull ? "Fully booked" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800" role="presentation">
          <div className={`h-full rounded-full transition-all duration-300 ${isFull ? "bg-rose-400" : "bg-amber-400"}`} style={{ width: `${fill}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || closed || (isFull && !optimistic.going)}
        aria-pressed={optimistic.going}
        className={`relative z-10 flex w-full items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60 ${
          variant === "full" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm"
        } ${
          optimistic.going
            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25"
            : "bg-amber-400 text-slate-950 hover:bg-amber-300"
        }`}
      >
        {isPending && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {!isPending && optimistic.going && <Check size={16} aria-hidden />}
        {label}
      </button>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>
      )}
    </div>
  );
}
