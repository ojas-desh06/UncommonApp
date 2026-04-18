import type {
  AdultLearnerProfile,
  AdultPrediction,
  Classification,
  College,
  SchoolPrediction,
} from "./types";
import { MOCK_COLLEGES } from "./mock-colleges";

function clamp(x: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, x));
}

function classify(chance: number): Classification {
  if (chance >= 0.6) return "safety";
  if (chance >= 0.3) return "target";
  if (chance >= 0.1) return "reach";
  return "hard_reach";
}

function predictOne(student: AdultLearnerProfile, college: College): SchoolPrediction {
  let chance = college.admission_rate;

  // Prior credits — biggest lever for adult learners
  if (student.prior_credits === "nearly_done") chance *= 2.0;
  else if (student.prior_credits === "substantial") chance *= 1.4;
  else if (student.prior_credits === "some") chance *= 1.1;

  // Work experience
  if (student.years_experience >= 10) chance *= 1.3;
  else if (student.years_experience >= 5) chance *= 1.2;
  else if (student.years_experience >= 2) chance *= 1.1;

  // Years since HS — more time = more demonstrated life experience
  if (student.years_gap === "10_20" || student.years_gap === "20_plus") chance *= 1.1;
  else if (student.years_gap === "5_10") chance *= 1.05;

  // HS GPA if remembered (lighter weight than for recent grads)
  if (student.hs_gpa != null && college.gpa_50 != null) {
    const delta = student.hs_gpa - college.gpa_50;
    chance *= Math.pow(1.3, delta * 2);
  }

  if (student.first_gen && college.cds_factors.first_gen !== "not_considered") {
    chance *= 1.15;
  }

  chance = clamp(chance, 0.01, 0.95);
  const classification = classify(chance);
  const chance_low = clamp(chance - 0.08, 0.01, 0.95);
  const chance_high = clamp(chance + 0.08, 0.02, 0.95);

  const working_for: string[] = [];
  const working_against: string[] = [];
  const what_would_help: string[] = [];

  if (student.prior_credits === "nearly_done") {
    working_for.push("Your substantial prior credits make you a strong transfer candidate — most of your degree work is already done.");
  } else if (student.prior_credits === "substantial") {
    working_for.push("Your prior college credits give you a clear head start and signal you can handle college-level work.");
  } else if (student.prior_credits === "none") {
    working_against.push("No prior college credits means you'll be evaluated as a freshman, competing against a younger pool.");
  }

  if (student.years_experience >= 10) {
    working_for.push(`${student.years_experience} years of professional experience is a genuine differentiator — committees value maturity and real-world context.`);
  } else if (student.years_experience >= 5) {
    working_for.push(`${student.years_experience} years of work experience signals focus and intent that many traditional applicants can't show.`);
  } else if (student.years_experience <= 1) {
    working_against.push("Limited work experience reduces one of the main advantages adult learners have over traditional applicants.");
  }

  if (student.hs_gpa != null && college.gpa_50 != null) {
    if (student.hs_gpa >= college.gpa_50) {
      working_for.push(`Your high school GPA of ${student.hs_gpa.toFixed(2)} meets or exceeds the school's admitted median (${college.gpa_50.toFixed(2)}).`);
    } else {
      working_against.push(`Your high school GPA of ${student.hs_gpa.toFixed(2)} is below the admitted median of ${college.gpa_50.toFixed(2)} — though committees often weight this less for adult learners.`);
    }
  }

  if (student.first_gen && college.cds_factors.first_gen !== "not_considered") {
    working_for.push("First-generation status is considered a positive factor here.");
  }

  if (student.degree_goal === "complete_bachelor") {
    working_for.push("Returning to complete an existing degree is a narrative committees find compelling — you've already proven you can do the work.");
  }

  if (college.cds_factors.essays === "very_important") {
    what_would_help.push("Essays are rated 'very important' — your personal statement about why you're returning now is your biggest opportunity to stand out.");
  }

  if (student.years_experience < 2 && student.prior_credits === "none") {
    what_would_help.push("Taking one or two community college courses first would both build credits and prove current academic readiness.");
  } else {
    what_would_help.push("Reach out directly to the admissions office — many schools have dedicated staff for adult learners who can advise on the strongest application.");
  }

  while (working_for.length < 3) {
    working_for.push(`Your stated goal of studying ${student.intended_major} aligns with programs this school offers.`);
  }
  while (working_against.length < 3) {
    working_against.push(`${(college.admission_rate * 100).toFixed(0)}% overall admission rate — non-traditional pathways vary by department.`);
  }

  return {
    college,
    classification,
    chance_low,
    chance_high,
    working_for: working_for.slice(0, 3),
    working_against: working_against.slice(0, 3),
    what_would_help: what_would_help.slice(0, 2),
  };
}

function buildHeadline(student: AdultLearnerProfile, schools: SchoolPrediction[]): string {
  const safeties = schools.filter((s) => s.classification === "safety").length;
  const targets = schools.filter((s) => s.classification === "target").length;
  const reaches = schools.filter((s) => s.classification === "reach" || s.classification === "hard_reach").length;
  const expLabel = student.years_experience >= 5 ? "strong work history" : "your background";
  if (targets + safeties >= 5) {
    return `${expLabel.charAt(0).toUpperCase() + expLabel.slice(1)} opens real doors — ${targets + safeties} of these ${schools.length} schools are realistic fits for your return.`;
  }
  if (reaches > schools.length / 2) {
    return `You're aiming high: ${reaches} of ${schools.length} schools are reaches. Strengthening your credits or experience profile would shift this list.`;
  }
  return `A balanced list for your return: ${safeties} safeties, ${targets} targets, ${reaches} reaches. Here's where each one stands.`;
}

export function generateMockAdultPrediction(
  id: string,
  student: AdultLearnerProfile,
): AdultPrediction {
  const schools = MOCK_COLLEGES.map((c) => predictOne(student, c)).sort(
    (a, b) => b.chance_high - a.chance_high,
  );
  return {
    id,
    student,
    generated_at: new Date().toISOString(),
    headline: buildHeadline(student, schools),
    schools,
  };
}
