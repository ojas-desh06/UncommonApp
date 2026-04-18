import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Classification } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(x: number, digits = 0): string {
  return `${(x * 100).toFixed(digits)}%`;
}

export function formatChanceRange(low: number, high: number): string {
  return `${formatPercent(low)} – ${formatPercent(high)}`;
}

export function formatCurrency(x: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(x);
}

export const classificationLabel: Record<Classification, string> = {
  safety: "Safety",
  target: "Target",
  reach: "Reach",
  hard_reach: "Hard reach",
};

export const classificationColorVar: Record<Classification, string> = {
  safety: "var(--safety)",
  target: "var(--target)",
  reach: "var(--reach)",
  hard_reach: "var(--hard-reach)",
};

export const classificationTextClass: Record<Classification, string> = {
  safety: "text-[color:var(--safety)]",
  target: "text-[color:var(--target)]",
  reach: "text-[color:var(--reach)]",
  hard_reach: "text-[color:var(--hard-reach)]",
};

export const classificationBgClass: Record<Classification, string> = {
  safety: "bg-[color:var(--safety)]/15 text-[color:var(--safety)] border-[color:var(--safety)]/30",
  target: "bg-[color:var(--target)]/15 text-[color:var(--target)] border-[color:var(--target)]/30",
  reach: "bg-[color:var(--reach)]/15 text-[color:var(--reach)] border-[color:var(--reach)]/30",
  hard_reach: "bg-[color:var(--hard-reach)]/15 text-[color:var(--hard-reach)] border-[color:var(--hard-reach)]/30",
};
