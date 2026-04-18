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
import type { StudentProfile } from "@/lib/types";

export function AcademicsSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<StudentProfile>();

  const testType = watch("test_type");
  const testOptional = testType === "test_optional";
  const testLabel = testType === "ACT" ? "ACT composite (1–36)" : "SAT total (400–1600)";

  return (
    <section>
      <SectionHeader
        step={1}
        title="Academics"
        blurb="The numerical core of your transcript — the first thing any committee looks at."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="GPA (unweighted)" htmlFor="gpa_unweighted" error={errors.gpa_unweighted?.message}>
          <Input
            id="gpa_unweighted"
            type="number"
            step="0.01"
            min={0}
            max={5}
            placeholder="3.85"
            {...register("gpa_unweighted", { valueAsNumber: true })}
          />
        </Field>
        <Field label="GPA (weighted)" htmlFor="gpa_weighted" error={errors.gpa_weighted?.message}>
          <Input
            id="gpa_weighted"
            type="number"
            step="0.01"
            min={0}
            max={5}
            placeholder="4.32"
            {...register("gpa_weighted", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Test type" error={errors.test_type?.message}>
          <Controller
            control={control}
            name="test_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAT">SAT</SelectItem>
                  <SelectItem value="ACT">ACT</SelectItem>
                  <SelectItem value="test_optional">Test optional</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          label={testLabel}
          htmlFor="test_score"
          error={errors.test_score?.message}
          description={testOptional ? "Optional — leave blank if not submitting" : undefined}
        >
          <Input
            id="test_score"
            type="number"
            step="1"
            disabled={testOptional}
            placeholder={testOptional ? "—" : testType === "ACT" ? "32" : "1480"}
            {...register("test_score", {
              setValueAs: (v) =>
                v === "" || v == null ? null : Number(v),
            })}
          />
        </Field>

        <Field
          label="Course rigor (# of APs / IBs / DE)"
          htmlFor="rigor_count"
          error={errors.rigor_count?.message}
          description="Count all advanced courses across your high school career."
          className="sm:col-span-2 lg:col-span-2"
        >
          <Input
            id="rigor_count"
            type="number"
            step="1"
            min={0}
            max={20}
            placeholder="7"
            {...register("rigor_count", { valueAsNumber: true })}
          />
        </Field>
      </div>
    </section>
  );
}
