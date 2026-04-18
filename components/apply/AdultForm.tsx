"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AcademicsAdultSection } from "./sections/AcademicsAdult";
import { ExperienceSection } from "./sections/Experience";
import { GoalsSection } from "./sections/Goals";
import { BackgroundAdultSection } from "./sections/BackgroundAdult";
import { PreferencesAdultSection } from "./sections/PreferencesAdult";
import {
  adultLearnerProfileSchema,
  adultPredictResponseSchema,
  type AdultLearnerProfile,
} from "@/lib/types";

const DEFAULTS: AdultLearnerProfile = {
  hs_gpa: null,
  years_gap: "5_10",
  prior_credits: "none",
  years_experience: 5,
  industry: "",
  work_experience: ["", "", ""],
  degree_goal: "start_bachelor",
  motivation: "",
  career_goal: "",
  state: "CA",
  first_gen: false,
  intended_major: "",
  schedule_preference: "either",
  format_preference: "any",
  region_preference: ["Any"],
  size_preference: "any",
  max_budget: 40000,
};

export function AdultForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AdultLearnerProfile>({
    resolver: zodResolver(adultLearnerProfileSchema),
    defaultValues: DEFAULTS,
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: AdultLearnerProfile) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/predict-adult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const json = await res.json();
      const parsed = adultPredictResponseSchema.parse(json);
      router.push(`/results?id=${parsed.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-12">
        <AcademicsAdultSection />
        <div className="h-px w-full bg-border" />
        <ExperienceSection />
        <div className="h-px w-full bg-border" />
        <GoalsSection />
        <div className="h-px w-full bg-border" />
        <BackgroundAdultSection />
        <div className="h-px w-full bg-border" />
        <PreferencesAdultSection />

        <div className="flex flex-col items-stretch gap-3 border-t border-border pt-8 sm:items-start">
          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto sm:min-w-48"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Running the committee…" : "Get my verdict"}
          </Button>
          <p className="text-xs text-muted-foreground">
            By submitting, you agree we may use your (anonymized) profile to improve our model.
          </p>
        </div>
      </form>
    </FormProvider>
  );
}
