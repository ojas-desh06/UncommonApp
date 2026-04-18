"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, SectionHeader } from "../Field";
import type { StudentProfile } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export function AwardsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<StudentProfile>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "awards" as never,
  });

  return (
    <section>
      <SectionHeader
        step={3}
        title="Awards"
        blurb="Prioritize ones with scope — school, regional, national, or international."
      />
      <div className="flex flex-col gap-4">
        {fields.map((field, i) => (
          <div key={field.id} className="flex items-start gap-2">
            <Field
              label={`Award ${i + 1} (optional)`}
              htmlFor={`award-${i}`}
              error={errors.awards?.[i]?.message}
              className="flex-1"
            >
              <Input
                id={`award-${i}`}
                placeholder={i === 0 ? "National Merit Semifinalist" : "Award, competition, recognition…"}
                {...register(`awards.${i}` as const)}
              />
            </Field>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="mt-7 rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remove award"
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
            Add another award
          </button>
        )}
      </div>
    </section>
  );
}
