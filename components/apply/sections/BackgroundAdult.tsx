"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, SectionHeader } from "../Field";
import { US_STATES, type AdultLearnerProfile } from "@/lib/types";

export function BackgroundAdultSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AdultLearnerProfile>();

  return (
    <section>
      <SectionHeader
        step={4}
        title="Background"
        blurb="A little context about where you're coming from."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Home state" error={errors.state?.message} className="sm:col-span-2">
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <div className="sm:col-span-2 flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-4">
          <Controller
            control={control}
            name="first_gen"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(Boolean(v))}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm text-foreground">First-generation college student</div>
                  <div className="text-xs text-muted-foreground">
                    Neither parent holds a four-year US college degree.
                  </div>
                </div>
              </label>
            )}
          />
        </div>
      </div>
    </section>
  );
}
