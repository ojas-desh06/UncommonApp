"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
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
} from "@/lib/utils";
import { Check, ChevronsUp, X } from "lucide-react";

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
                <AnimatedPercent value={midpoint} color={color} />
                <span className="text-sm text-muted-foreground">
                  {formatChanceRange(school.chance_low, school.chance_high)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${midpoint * 100}%` }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  style={{
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

          <motion.div
            className="grid gap-5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.25 },
              },
            }}
          >
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
          </motion.div>

          <div className="border-t border-border pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
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
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
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
    </motion.div>
  );
}

function AnimatedPercent({ value, color }: { value: number; color: string }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => `${Math.round(v * 100)}%`);

  useEffect(() => {
    count.set(0);
    const controls = animate(count, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, count]);

  return (
    <motion.span
      className="font-serif text-6xl font-normal leading-none tabular-nums"
      style={{ color }}
    >
      {display}
    </motion.span>
  );
}
