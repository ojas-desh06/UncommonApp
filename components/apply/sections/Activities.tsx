"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, SectionHeader } from "../Field";
import type { StudentProfile } from "@/lib/types";

export function ActivitiesSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<StudentProfile>();

  return (
    <section>
      <SectionHeader
        step={2}
        title="Activities"
        blurb="Five one-liners. What did you do, for how long, and to what end? Be specific."
      />
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Field
            key={i}
            label={`Activity ${i + 1}`}
            htmlFor={`activity-${i}`}
            error={errors.activities?.[i]?.message}
          >
            <Input
              id={`activity-${i}`}
              placeholder={
                i === 0
                  ? "Founded school debate team; 3rd at state — 4 yrs, 10 hrs/wk"
                  : "Role, context, outcome, hours per week, years"
              }
              {...register(`activities.${i}` as const)}
            />
          </Field>
        ))}
      </div>
    </section>
  );
}
