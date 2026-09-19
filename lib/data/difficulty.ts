import type { Difficulty } from "@/types/domain";

export interface DifficultyMeta {
  readonly summary: string;
  readonly bring: readonly string[];
  readonly badge: string;
  readonly dot: string;
}

export const DIFFICULTY_META: Record<Difficulty, DifficultyMeta> = {
  Beginner: {
    summary: "Walking and crawling passage. No prior experience or technical gear required.",
    bring: ["Helmet with headlamp (loaner available)", "Three independent light sources", "Sturdy boots and clothes you can ruin", "Water and a snack"],
    badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
    dot: "bg-emerald-400",
  },
  Vertical: {
    summary: "Rope work on pits and drops. You should be comfortable with a harness and basic rope skills.",
    bring: ["Full single-rope-technique kit", "Helmet with chin strap", "Gloves and knee pads", "Three independent light sources"],
    badge: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
    dot: "bg-amber-400",
  },
  Rescue: {
    summary: "Team drills simulating an underground evacuation. Vertical competence is a prerequisite.",
    bring: ["Personal SRT kit and helmet", "Team radio if you own one", "Warm layers for long static periods", "Food for a full day"],
    badge: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
    dot: "bg-rose-400",
  },
};
