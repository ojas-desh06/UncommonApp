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
import { US_STATES, type StudentProfile } from "@/lib/types";

const SCHOOL_TYPES: { value: StudentProfile["school_type"]; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "magnet", label: "Magnet" },
  { value: "charter", label: "Charter" },
  { value: "homeschool", label: "Homeschool" },
  { value: "other", label: "Other" },
];

export function BackgroundSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<StudentProfile>();

  return (
    <section>
      <SectionHeader
        step={4}
        title="Background"
        blurb="Context matters. Committees read your file against the opportunities you had."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Home state" error={errors.state?.message}>
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

        <Field label="School type" error={errors.school_type?.message}>
          <Controller
            control={control}
            name="school_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-4">
          <CheckboxField
            name="first_gen"
            label="First-generation college student"
            description="Neither parent holds a four-year US college degree."
          />
          <CheckboxField
            name="legacy"
            label="Legacy at one or more schools"
            description="Parent or grandparent attended a US college where you're applying."
          />
          <CheckboxField
            name="recruited_athlete"
            label="Recruited athlete"
            description="In active contact with a coach about roster commitment."
          />
        </div>
      </div>
    </section>
  );
}

function CheckboxField({
  name,
  label,
  description,
}: {
  name: "first_gen" | "legacy" | "recruited_athlete";
  label: string;
  description?: string;
}) {
  const { control } = useFormContext<StudentProfile>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={field.value}
            onCheckedChange={(v) => field.onChange(Boolean(v))}
            className="mt-0.5"
          />
          <div>
            <div className="text-sm text-foreground">{label}</div>
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
        </label>
      )}
    />
  );
}
