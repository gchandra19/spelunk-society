"use client";

import { Star } from "lucide-react";

interface StarInputProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
}

export function StarInput({ value, onChange }: StarInputProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)} className="rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
          <Star size={28} className={n <= value ? "fill-amber-400 text-amber-400" : "text-slate-600"} />
        </button>
      ))}
    </div>
  );
}
