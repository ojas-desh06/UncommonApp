import { z } from "zod";

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
] as const;

export const usStateSchema = z.enum(US_STATES);
export type USState = z.infer<typeof usStateSchema>;

export const testTypeSchema = z.enum(["SAT", "ACT", "test_optional"]);
export type TestType = z.infer<typeof testTypeSchema>;

export const schoolTypeSchema = z.enum([
  "public",
  "private",
  "magnet",
  "charter",
  "homeschool",
  "other",
]);
export type SchoolType = z.infer<typeof schoolTypeSchema>;

export const regionSchema = z.enum([
  "Northeast",
  "Midwest",
  "South",
  "West",
  "Any",
]);
export type Region = z.infer<typeof regionSchema>;

export const sizePreferenceSchema = z.enum([
  "small",
  "medium",
  "large",
  "any",
]);
export type SizePreference = z.infer<typeof sizePreferenceSchema>;

export const cdsWeightSchema = z.enum([
  "very_important",
  "important",
  "considered",
  "not_considered",
]);
export type CdsWeight = z.infer<typeof cdsWeightSchema>;

export const classificationSchema = z.enum([
  "safety",
  "target",
  "reach",
  "hard_reach",
]);
export type Classification = z.infer<typeof classificationSchema>;

export const studentProfileSchema = z.object({
  gpa_unweighted: z.number().min(0).max(5),
  gpa_weighted: z.number().min(0).max(5),
  test_type: testTypeSchema,
  test_score: z.number().int().nullable(),
  rigor_count: z.number().int().min(0).max(20),
  activities: z.array(z.string().max(240)).length(5),
  awards: z.array(z.string().max(240)).max(3),
  state: usStateSchema,
  school_type: schoolTypeSchema,
  first_gen: z.boolean(),
  legacy: z.boolean(),
  legacy_schools: z.array(z.string()),
  recruited_athlete: z.boolean(),
  intended_major: z.string().min(1).max(120),
  region_preference: z.array(regionSchema).min(1),
  size_preference: sizePreferenceSchema,
  max_budget: z.number().min(0).max(120000),
}).superRefine((val, ctx) => {
  if (val.test_type === "test_optional") {
    return;
  }
  if (val.test_score == null) {
    ctx.addIssue({
      code: "custom",
      path: ["test_score"],
      message: "Enter a score or choose test optional",
    });
    return;
  }
  if (val.test_type === "SAT" && (val.test_score < 400 || val.test_score > 1600)) {
    ctx.addIssue({
      code: "custom",
      path: ["test_score"],
      message: "SAT must be 400–1600",
    });
  }
  if (val.test_type === "ACT" && (val.test_score < 1 || val.test_score > 36)) {
    ctx.addIssue({
      code: "custom",
      path: ["test_score"],
      message: "ACT must be 1–36",
    });
  }
});
export type StudentProfile = z.infer<typeof studentProfileSchema>;

export const cdsFactorsSchema = z.object({
  rigor: cdsWeightSchema,
  gpa: cdsWeightSchema,
  test_scores: cdsWeightSchema,
  essays: cdsWeightSchema,
  recommendations: cdsWeightSchema,
  ecs: cdsWeightSchema,
  demonstrated_interest: cdsWeightSchema,
  first_gen: cdsWeightSchema,
  legacy: cdsWeightSchema,
});
export type CdsFactors = z.infer<typeof cdsFactorsSchema>;

export const collegeSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.object({
    state: z.string(),
    city: z.string(),
    lat: z.number(),
    lon: z.number(),
  }),
  type: z.enum(["public", "private"]),
  size: z.number().int(),
  admission_rate: z.number().min(0).max(1),
  sat_25: z.number().int().nullable(),
  sat_75: z.number().int().nullable(),
  gpa_50: z.number().nullable(),
  tuition: z.number().int(),
  has_merit_aid: z.boolean(),
  top_majors: z.array(z.string()),
  cds_factors: cdsFactorsSchema,
});
export type College = z.infer<typeof collegeSchema>;

export const schoolPredictionSchema = z.object({
  college: collegeSchema,
  classification: classificationSchema,
  chance_low: z.number().min(0).max(1),
  chance_high: z.number().min(0).max(1),
  working_for: z.array(z.string()).length(3),
  working_against: z.array(z.string()).length(3),
  what_would_help: z.array(z.string()).min(1).max(2),
});
export type SchoolPrediction = z.infer<typeof schoolPredictionSchema>;

export const predictionSchema = z.object({
  id: z.string(),
  student: studentProfileSchema,
  generated_at: z.string(),
  headline: z.string(),
  schools: z.array(schoolPredictionSchema),
});
export type Prediction = z.infer<typeof predictionSchema>;

export const predictResponseSchema = z.object({
  id: z.string(),
  prediction: predictionSchema,
});
export type PredictResponse = z.infer<typeof predictResponseSchema>;
