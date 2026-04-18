"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  description,
  error,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm text-foreground/90">
          {label}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SectionHeader({
  step,
  title,
  blurb,
}: {
  step: number;
  title: string;
  blurb?: string;
}) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Section {step}
      </div>
      <h2 className="mt-2 font-serif text-2xl text-foreground">{title}</h2>
      {blurb && (
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {blurb}
        </p>
      )}
    </div>
  );
}
