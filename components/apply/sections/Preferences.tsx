"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Field, SectionHeader } from "../Field";
import type { Region, StudentProfile } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const REGIONS: Region[] = ["Northeast", "Midwest", "South", "West", "Any"];

export function PreferencesSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<StudentProfile>();

  return (
    <section>
      <SectionHeader
        step={5}
        title="Preferences"
        blurb="What you're looking for — we'll weight recommendations accordingly."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Intended major"
          htmlFor="intended_major"
          error={errors.intended_major?.message}
          className="sm:col-span-2 lg:col-span-3"
        >
          <Input
            id="intended_major"
            placeholder="Computer Science, Undecided — Humanities leaning, etc."
            {...register("intended_major")}
          />
        </Field>

        <Field
          label="Region preference"
          error={errors.region_preference?.message}
          description="Check as many as apply. 'Any' overrides the others."
          className="sm:col-span-2 lg:col-span-3"
        >
          <Controller
            control={control}
            name="region_preference"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => {
                  const checked = field.value.includes(r);
                  return (
                    <label
                      key={r}
                      className={`cursor-pointer select-none rounded-lg border px-4 py-2 text-sm transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${
                        checked
                          ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_1px_var(--color-primary),0_4px_12px_-4px_var(--color-primary)]"
                          : "border-border text-foreground/80 hover:border-foreground/30 hover:bg-muted/60"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const on = Boolean(v);
                          const next = on
                            ? Array.from(new Set([...field.value, r]))
                            : field.value.filter((x) => x !== r);
                          field.onChange(next);
                        }}
                        className="sr-only"
                      />
                      {r}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </Field>

        <Field label="Size preference" error={errors.size_preference?.message}>
          <Controller
            control={control}
            name="size_preference"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (&lt; 3,000)</SelectItem>
                  <SelectItem value="medium">Medium (3,000–10,000)</SelectItem>
                  <SelectItem value="large">Large (&gt; 10,000)</SelectItem>
                  <SelectItem value="any">No preference</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          label="Max annual budget"
          error={errors.max_budget?.message}
          description="All-in cost of attendance you're willing to pay."
        >
          <Controller
            control={control}
            name="max_budget"
            render={({ field }) => (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg">
                    {formatCurrency(field.value)}
                  </span>
                  <span className="text-xs text-muted-foreground">per year</span>
                </div>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={90000}
                  step={2500}
                  onValueChange={(v) =>
                    field.onChange(Array.isArray(v) ? v[0] : v)
                  }
                />
              </div>
            )}
          />
        </Field>
      </div>
    </section>
  );
}
