import { BadgeCheck, Hourglass } from "lucide-react";
import type { GearItem } from "@/lib/data/gear";

/** Honest status: a guide is only "expert reviewed" once a named reviewer is recorded in lib/data/gear.ts. */
export function ExpertReviewStatus({ review }: { readonly review: GearItem["review"] }) {
  return review ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300 ring-1 ring-violet-500/40">
      <BadgeCheck size={14} aria-hidden />Expert reviewed by {review.by} &middot; {review.on}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-700" title="A qualified caving instructor hasn't checked this guide yet">
      <Hourglass size={14} aria-hidden />Awaiting expert review
    </span>
  );
}
