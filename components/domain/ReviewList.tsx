import { Star } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import type { Review } from "@/types/domain";

const Stars = ({ value }: { value: number }) => (
  <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-600"} />)}
  </span>
);

export function ReviewList({ reviews }: { readonly reviews: readonly Review[] }) {
  if (reviews.length === 0) return <p className="text-slate-400">No reviews yet.</p>;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div>
      <p className="mb-5 flex items-center gap-3 text-slate-300">
        <Stars value={avg} /> <span className="font-semibold">{avg.toFixed(1)}</span>
        <span className="text-slate-500">&middot; {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
      </p>
      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{r.authorName}</p>
              <time dateTime={r.createdAt} className="text-xs text-slate-500">{formatShortDate(r.createdAt)}</time>
            </div>
            <div className="mt-1"><Stars value={r.rating} /></div>
            <p className="mt-3 whitespace-pre-line text-slate-300">{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
