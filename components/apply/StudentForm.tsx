"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AcademicsSection } from "./sections/Academics";
import { ActivitiesSection } from "./sections/Activities";
import { AwardsSection } from "./sections/Awards";
import { BackgroundSection } from "./sections/Background";
import { PreferencesSection } from "./sections/Preferences";
import { EssaySection } from "./sections/Essay";
import {
  predictResponseSchema,
  studentProfileSchema,
  type StudentProfile,
} from "@/lib/types";

const DEFAULTS: StudentProfile = {
  gpa_unweighted: 3.8,
  gpa_weighted: 4.2,
  test_type: "SAT",
  test_score: 1450,
  rigor_count: 6,
  activities: ["", "", "", "", "", "", "", "", "", ""],
  awards: ["", "", ""],
  state: "CA",
  school_type: "public",
  first_gen: false,
  legacy: false,
  legacy_schools: [],
  recruited_athlete: false,
  intended_major: "",
  region_preference: ["Any"],
  size_preference: "any",
  max_budget: 60000,
  campus_setting: "any",
  sports_culture: "moderate",
  greek_life: "nice_to_have",
  research: "nice_to_have",
  weather: "any",
  diversity: "somewhat",
  essay: "",
};

export function StudentForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);

  const form = useForm<StudentProfile>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: DEFAULTS,
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: StudentProfile) => {
    setSubmitError(null);
    try {
      const cleaned: StudentProfile = {
        ...data,
        awards: data.awards.filter((a) => a.trim().length > 0),
      };
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cleaned, essay_pdf_base64: pdfBase64 }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const json = await res.json();
      const parsed = predictResponseSchema.parse(json);
      router.push(`/results?id=${parsed.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-12">
        <AcademicsSection />
        <div className="h-px w-full bg-border" />
        <ActivitiesSection />
        <div className="h-px w-full bg-border" />
        <AwardsSection />
        <div className="h-px w-full bg-border" />
        <BackgroundSection />
        <div className="h-px w-full bg-border" />
        <PreferencesSection />
        <div className="h-px w-full bg-border" />
        <EssaySection
          pdfName={pdfName}
          onPdfChange={(base64, name) => { setPdfBase64(base64); setPdfName(name); }}
          onPdfRemove={() => { setPdfBase64(null); setPdfName(null); }}
        />

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
