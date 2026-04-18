"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, SectionHeader } from "../Field";
import type { AdultLearnerProfile } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export function ExperienceSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AdultLearnerProfile>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "work_experience" as never,
  });

  return (
    <section>
      <SectionHeader
        step={2}
        title="Work Experience"
        blurb="Your professional background is one of your strongest assets. Be specific about what you did and what it led to."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Years of work experience"
          htmlFor="years_experience"
          error={errors.years_experience?.message}
        >
          <Input
            id="years_experience"
            type="number"
            step="1"
            min={0}
            max={50}
            placeholder="8"
            {...register("years_experience", { valueAsNumber: true })}
          />
        </Field>

        <Field
          label="Industry / field"
          htmlFor="industry"
          error={errors.industry?.message}
        >
          <Input
            id="industry"
            placeholder="Healthcare, Software, Education, Finance…"
            {...register("industry")}
          />
        </Field>

        <div className="flex flex-col gap-4 sm:col-span-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-start gap-2">
              <Field
                label={`Role ${i + 1}${i > 0 ? " (optional)" : ""}`}
                htmlFor={`work-${i}`}
                error={errors.work_experience?.[i]?.message}
                className="flex-1"
              >
                <Input
                  id={`work-${i}`}
                  placeholder={
                    i === 0
                      ? "Registered Nurse, Memorial Hospital — 6 yrs, managed ICU team of 12"
                      : "Job title, employer — context, scope, outcome"
                  }
                  {...register(`work_experience.${i}` as const)}
                />
              </Field>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="mt-7 rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Remove role"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}

          {fields.length < 10 && (
            <button
              type="button"
              onClick={() => append("")}
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Plus className="size-4" />
              Add another role
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
