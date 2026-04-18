"use client";

import type { Classification, SchoolPrediction } from "@/lib/types";
import { SchoolCard } from "./SchoolCard";
import { classificationLabel } from "@/lib/utils";

const GROUPS: {
  key: Classification | "reach_combined";
  label: string;
  color: string;
  includes: Classification[];
}[] = [
  { key: "safety", label: "Safeties", color: "var(--safety)", includes: ["safety"] },
  { key: "target", label: "Targets", color: "var(--target)", includes: ["target"] },
  { key: "reach_combined", label: "Reaches", color: "var(--hard-reach)", includes: ["reach", "hard_reach"] },
];

export function SchoolList({
  schools,
  onSelect,
}: {
  schools: SchoolPrediction[];
  onSelect: (s: SchoolPrediction) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map((g) => {
        const items = schools
          .filter((s) => g.includes.includes(s.classification))
          .sort((a, b) => b.chance_high - a.chance_high);

        return (
          <section key={g.key}>
            <header className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }}
                />
                <h2 className="font-serif text-lg text-foreground">{g.label}</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {items.length} school{items.length === 1 ? "" : "s"}
              </span>
            </header>
            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/30 p-4 text-center text-xs text-muted-foreground">
                No {classificationLabel[g.includes[0]].toLowerCase()}s in this set.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((s) => (
                  <SchoolCard
                    key={s.college.id}
                    school={s}
                    onClick={() => onSelect(s)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
