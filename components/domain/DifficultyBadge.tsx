import { DIFFICULTY_META } from "@/lib/data/difficulty";
import type { Difficulty } from "@/types/domain";

export function DifficultyBadge({ difficulty }: { readonly difficulty: Difficulty }) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span className="inline-block rounded-full bg-slate-950/85">
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 backdrop-blur ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {difficulty}
    </span>
    </span>
  );
}
