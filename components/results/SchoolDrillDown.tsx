"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SchoolPrediction } from "@/lib/types";
import {
  classificationColorVar,
  classificationLabel,
  formatChanceRange,
  formatCurrency,
  formatPercent,
} from "@/lib/utils";
import { Check, ChevronsUp, Mic, X } from "lucide-react";

export function SchoolDrillDown({
  school,
  open,
  onOpenChange,
}: {
  school: SchoolPrediction | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!school) return null;
  const { college } = school;
  const midpoint = (school.chance_low + school.chance_high) / 2;
  const color = classificationColorVar[school.classification];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl overflow-hidden p-0 sm:max-w-2xl">
        {/* Color accent bar at top */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }} />

        <div className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="font-serif text-2xl leading-tight tracking-tight">
                  {college.name}
                </DialogTitle>
                <DialogDescription>
                  {college.location.city}, {college.location.state} ·{" "}
                  {college.type === "public" ? "Public" : "Private"} ·{" "}
                  {college.size.toLocaleString()} undergrad · Sticker{" "}
                  {formatCurrency(college.tuition)}
                </DialogDescription>
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
              >
                {classificationLabel[school.classification]}
              </span>
            </div>
          </DialogHeader>

          {/* Chance display */}
          <div
            className="relative overflow-hidden rounded-xl p-5"
            style={{ background: `${color}10`, border: `1px solid ${color}25` }}
          >
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Estimated chance
              </div>
              <div className="flex items-baseline gap-3">
                <span
                  className="font-serif text-6xl font-normal leading-none"
                  style={{ color }}
                >
                  {formatPercent(midpoint)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatChanceRange(school.chance_low, school.chance_high)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${midpoint * 100}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 10px ${color}60`,
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/50">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <Section
              icon={<Check className="size-4" />}
              title="Working for you"
              color="var(--safety)"
              items={school.working_for}
            />
            <Section
              icon={<X className="size-4" />}
              title="Working against you"
              color="var(--hard-reach)"
              items={school.working_against}
            />
            <Section
              icon={<ChevronsUp className="size-4" />}
              title="What would move the needle"
              color="var(--target)"
              items={school.what_would_help}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                console.log("Interview with Admissions Officer", college.id);
              }}
            >
              <Mic className="size-4" />
              Interview with Admissions Officer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon,
  title,
  color,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  items: string[];
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2" style={{ color }}>
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-widest">{title}</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-foreground/85"
          >
            <span className="mt-1 size-1 shrink-0 rounded-full" style={{ background: color, marginTop: "7px" }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
