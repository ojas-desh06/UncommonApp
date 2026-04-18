"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Prediction, SchoolPrediction } from "@/lib/types";
import { SchoolList } from "./SchoolList";
import { SchoolDrillDown } from "./SchoolDrillDown";

const USMap = dynamic(() => import("./USMap").then((m) => m.USMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-lg border border-border bg-card/30 text-sm text-muted-foreground">
      Drawing the map…
    </div>
  ),
});

export function ResultsView({ prediction }: { prediction: Prediction }) {
  const [selected, setSelected] = useState<SchoolPrediction | null>(null);
  const [open, setOpen] = useState(false);

  const openSchool = (s: SchoolPrediction) => {
    setSelected(s);
    setOpen(true);
  };

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="rounded-xl border border-border bg-card/40 p-4 shadow-[0_0_40px_-15px_var(--color-primary)]" style={{ boxShadow: "0 0 60px -20px oklch(0.82 0.22 162 / 0.15)" }}>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-serif text-lg text-foreground">Your map</h2>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <LegendDot color="var(--safety)" label="Safety" />
              <LegendDot color="var(--target)" label="Target" />
              <LegendDot color="var(--reach)" label="Reach" />
              <LegendDot color="var(--hard-reach)" label="Hard" />
            </div>
          </div>
          <USMap schools={prediction.schools} onSelect={openSchool} />
        </div>

        <div>
          <SchoolList schools={prediction.schools} onSelect={openSchool} />
        </div>
      </div>

      <SchoolDrillDown
        school={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block size-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {label}
    </span>
  );
}
