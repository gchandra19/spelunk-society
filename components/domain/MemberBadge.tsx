import { BadgeCheck } from "lucide-react";
import type { Author, Role, SkillLevel } from "@/types/domain";

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  vertical: "Vertical",
  rescue: "Rescue",
};

const LEVEL_STYLES: Record<SkillLevel, string> = {
  beginner: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  intermediate: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  vertical: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  rescue: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
};

/** Skill level, plus a "Verified expert" mark for admin-approved experts. */
export function MemberBadge({ level, role }: { readonly level: SkillLevel; readonly role: Role }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
      {role === "expert" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold text-violet-300 ring-1 ring-violet-500/40" title="Verified caving expert">
          <BadgeCheck size={12} aria-hidden />Expert
        </span>
      )}
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${LEVEL_STYLES[level]}`}>{SKILL_LABELS[level]}</span>
    </span>
  );
}

export function AuthorLine({ author }: { readonly author: Author }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="font-medium">{author.authorName}</span>
      <MemberBadge level={author.authorLevel} role={author.authorRole} />
    </span>
  );
}
