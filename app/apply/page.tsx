import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StudentForm } from "@/components/apply/StudentForm";
import { AdultForm } from "@/components/apply/AdultForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Build your profile — Verdict",
};

type SearchParams = Promise<{ path?: string }>;

const STUDENT_STEPS = ["Academics", "Activities", "Awards", "Background", "Preferences", "Essay"];
const ADULT_STEPS = ["Academics", "Experience", "Goals", "Background", "Preferences"];

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const isAdult = params.path === "returning";
  const steps = isAdult ? ADULT_STEPS : STUDENT_STEPS;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="flex gap-16">
          {/* Sidebar */}
          <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col">
            <div className="sticky top-8 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="font-serif text-xl tracking-tight text-foreground"
                >
                  Verdict
                </Link>
                <ThemeToggle />
              </div>
              <div>
                <Link
                  href="/"
                  className="group mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back
                </Link>
                <h1 className="font-serif text-2xl leading-tight text-foreground">
                  Build your profile.
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {isAdult
                    ? "Five sections tailored for returning students."
                    : "Six sections. Essay analyzed by AI."}
                </p>
              </div>
              <nav className="flex flex-col gap-0.5">
                {steps.map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Form */}
          <div className="min-w-0 flex-1">
            {/* Mobile header */}
            <div className="mb-10 lg:hidden">
              <Link
                href="/"
                className="group mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back
              </Link>
              <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                Build your profile.
              </h1>
              <p className="mt-3 text-muted-foreground">
                {isAdult
                  ? "Five sections tailored for returning students. About five minutes."
                  : "Six sections. About five minutes. Your essay is analyzed by AI and factors into your results."}
              </p>
            </div>

            {isAdult ? <AdultForm /> : <StudentForm />}
          </div>
        </div>
      </div>
    </main>
  );
}
