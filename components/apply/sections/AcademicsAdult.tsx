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
import { Field, SectionHeader } from "../Field";
import type { AdultLearnerProfile } from "@/lib/types";

export function AcademicsAdultSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AdultLearnerProfile>();

  return (
    <section>
      <SectionHeader
        step={1}
        title="Academic History"
        blurb="Your high school background and any college credits you've accumulated — committees weigh these differently for returning students."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Years since high school graduation" error={errors.years_gap?.message}>
          <Controller
            control={control}
            name="years_gap"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2_5">2–5 years</SelectItem>
                  <SelectItem value="5_10">5–10 years</SelectItem>
                  <SelectItem value="10_20">10–20 years</SelectItem>
                  <SelectItem value="20_plus">20+ years</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          label="High school GPA (optional)"
          htmlFor="hs_gpa"
          error={errors.hs_gpa?.message}
          description="Leave blank if you don't remember — it carries less weight for returning students."
        >
          <Input
            id="hs_gpa"
            type="number"
            step="0.01"
            min={0}
            max={5}
            placeholder="3.2"
            {...register("hs_gpa", {
              setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
            })}
          />
        </Field>

        <Field
          label="Prior college credits"
          error={errors.prior_credits?.message}
          description="Count any community college, university, or transfer credits."
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="prior_credits"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="some">Some (fewer than 30 credits)</SelectItem>
                  <SelectItem value="substantial">Substantial (30–60 credits)</SelectItem>
                  <SelectItem value="nearly_done">Nearly done (60+ credits)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
    </section>
  );
}
