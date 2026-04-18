"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, SectionHeader } from "../Field";
import type { AdultLearnerProfile } from "@/lib/types";

export function ExperienceSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AdultLearnerProfile>();

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
          {[0, 1, 2].map((i) => (
            <Field
              key={i}
              label={`Role ${i + 1}${i > 0 ? " (optional)" : ""}`}
              htmlFor={`work-${i}`}
              error={errors.work_experience?.[i]?.message}
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
          ))}
        </div>
      </div>
    </section>
  );
}
