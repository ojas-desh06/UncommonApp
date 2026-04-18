"use client";

import type { SchoolPrediction } from "@/lib/types";
import {
  classificationBgClass,
  formatChanceRange,
  formatPercent,
} from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export function SchoolCard({
  school,
  onClick,
}: {
  school: SchoolPrediction;
  onClick: () => void;
}) {
  const midpoint = (school.chance_low + school.chance_high) / 2;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card/60 p-3 text-left transition-colors hover:border-foreground/25 hover:bg-card"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">
          {school.college.name}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {school.college.location.city}, {school.college.location.state} ·{" "}
          {formatChanceRange(school.chance_low, school.chance_high)}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-medium ${classificationBgClass[school.classification]}`}
        >
          {formatPercent(midpoint)}
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
