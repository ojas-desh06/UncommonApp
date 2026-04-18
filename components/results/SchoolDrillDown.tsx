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
  classificationBgClass,
  classificationLabel,
  formatChanceRange,
  formatCurrency,
  formatPercent,
} from "@/lib/utils";
import {
  Check,
  ChevronsUp,
  Mic,
  X,
} from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl overflow-hidden p-0 sm:max-w-2xl">
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
                className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium ${classificationBgClass[school.classification]}`}
              >
                {classificationLabel[school.classification]}
              </span>
            </div>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-card/40 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Estimated chance
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-serif text-4xl text-foreground">
                {formatPercent(midpoint)}
              </span>
              <span className="text-sm text-muted-foreground">
                confidence range {formatChanceRange(school.chance_low, school.chance_high)}
              </span>
            </div>
          </div>

          <div className="grid gap-5">
            <Section
              icon={<Check className="size-4" />}
              title="Working for you"
              tone="safety"
              items={school.working_for}
            />
            <Section
              icon={<X className="size-4" />}
              title="Working against you"
              tone="hard_reach"
              items={school.working_against}
            />
            <Section
              icon={<ChevronsUp className="size-4" />}
              title="What would move the needle"
              tone="target"
              items={school.what_would_help}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Voice-interview feature lands next — placeholder action.
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
  tone,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  tone: "safety" | "hard_reach" | "target";
  items: string[];
}) {
  const toneColor =
    tone === "safety"
      ? "var(--safety)"
      : tone === "hard_reach"
        ? "var(--hard-reach)"
        : "var(--target)";
  return (
    <div>
      <div className="mb-2 flex items-center gap-2" style={{ color: toneColor }}>
        {icon}
        <h3 className="text-sm font-medium uppercase tracking-wide">{title}</h3>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="pl-3 text-sm leading-relaxed text-foreground/90 before:mr-2 before:content-['—']"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
