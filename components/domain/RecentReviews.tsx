import Link from "next/link";
import { Star } from "lucide-react";
import { AuthorLine } from "@/components/domain/MemberBadge";
import { formatShortDate } from "@/lib/format";
import type { RecentReview } from "@/types/domain";

export function RecentReviews({ reviews }: { readonly reviews: readonly RecentReview[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((r) => (
        <li key={r.id} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="inline-flex" role="img" aria-label={`${r.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className={n <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"} />)}
          </span>
          <p className="mt-3 flex-1 text-slate-300">&ldquo;{r.body}&rdquo;</p>
          <div className="mt-4 flex items-baseline justify-between gap-3 text-sm">
            <AuthorLine author={r} />
            <time dateTime={r.createdAt} className="text-xs text-slate-500">{formatShortDate(r.createdAt)}</time>
          </div>
          <Link href={`/events/${r.eventId}`} className="mt-1 text-sm text-amber-300 hover:text-amber-200">{r.eventTitle} &rarr;</Link>
        </li>
      ))}
    </ul>
  );
}
