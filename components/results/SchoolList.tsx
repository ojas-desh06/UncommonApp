"use client";

import type { Classification, SchoolPrediction } from "@/lib/types";
import { SchoolCard } from "./SchoolCard";
import { classificationLabel } from "@/lib/utils";

const GROUPS: { key: Classification | "reach_combined"; label: string; includes: Classification[] }[] = [
  { key: "safety", label: "Safeties", includes: ["safety"] },
  { key: "target", label: "Targets", includes: ["target"] },
  { key: "reach_combined", label: "Reaches", includes: ["reach", "hard_reach"] },
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
            <header className="mb-3 flex items-baseline justify-between">
              <h2 className="font-serif text-xl text-foreground">{g.label}</h2>
              <span className="text-xs text-muted-foreground">
                {items.length} school{items.length === 1 ? "" : "s"}
              </span>
            </header>
            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/30 p-4 text-center text-xs text-muted-foreground">
                No {classificationLabel[g.includes[0]].toLowerCase()}s in this 10-college demo set.
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
