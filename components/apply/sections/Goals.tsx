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

export function GoalsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AdultLearnerProfile>();

  return (
    <section>
      <SectionHeader
        step={3}
        title="Goals"
        blurb="Why now, and where are you headed? Admissions committees treat purpose as a real factor for returning students."
      />
      <div className="flex flex-col gap-5">
        <Field label="Degree goal" error={errors.degree_goal?.message}>
          <Controller
            control={control}
            name="degree_goal"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start_bachelor">Starting a bachelor's degree for the first time</SelectItem>
                  <SelectItem value="complete_bachelor">Completing a bachelor's I previously started</SelectItem>
                  <SelectItem value="specific_program">Enrolling in a specific professional program</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          label="Why are you returning now?"
          htmlFor="motivation"
          error={errors.motivation?.message}
          description="Up to 500 characters. This is your personal statement in miniature — be honest and specific."
        >
          <textarea
            id="motivation"
            maxLength={500}
            rows={4}
            placeholder="After ten years in nursing I want to move into healthcare administration, which requires the credential I never finished…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 resize-none"
            {...register("motivation")}
          />
        </Field>

        <Field
          label="Career goal"
          htmlFor="career_goal"
          error={errors.career_goal?.message}
          description="Where do you want to be in 5 years? One sentence is fine."
        >
          <Input
            id="career_goal"
            placeholder="Hospital administrator, software engineer, high school teacher…"
            {...register("career_goal")}
          />
        </Field>
      </div>
    </section>
  );
}
