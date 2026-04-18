"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, SectionHeader } from "../Field";
import type { StudentProfile } from "@/lib/types";

export function AwardsSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<StudentProfile>();

  return (
    <section>
      <SectionHeader
        step={3}
        title="Awards"
        blurb="Up to three — prioritize ones with scope (school / regional / national / international)."
      />
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <Field
            key={i}
            label={`Award ${i + 1}${i > 0 ? " (optional)" : ""}`}
            htmlFor={`award-${i}`}
            error={errors.awards?.[i]?.message}
          >
            <Input
              id={`award-${i}`}
              placeholder={i === 0 ? "National Merit Semifinalist" : ""}
              {...register(`awards.${i}` as const)}
            />
          </Field>
        ))}
      </div>
    </section>
  );
}
