"use client";

import type { SchoolPrediction } from "@/lib/types";
import {
  classificationColorVar,
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
  const color = classificationColorVar[school.classification];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border border-border bg-card/60 p-3 pl-4 text-left transition-all duration-150 hover:bg-card"
      style={
        {
          borderLeftColor: color,
          borderLeftWidth: "3px",
          "--glow": color,
        } as React.CSSProperties
      }
    >
      {/* subtle hover bg tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at left, ${color}08 0%, transparent 70%)` }}
      />

      <div className="relative min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">
          {school.college.name}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {school.college.location.city}, {school.college.location.state} ·{" "}
          {formatChanceRange(school.chance_low, school.chance_high)}
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        {school.campus_fit < 0.5 && (
          <span className="hidden text-[10px] text-muted-foreground sm:block">low fit</span>
        )}
        {school.campus_fit >= 0.75 && (
          <span className="hidden text-[10px] sm:block" style={{ color: "var(--safety)" }}>great fit</span>
        )}
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {formatPercent(midpoint)}
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" style={{ color: `${color}99` }} />
      </div>
    </button>
  );
}
