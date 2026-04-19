import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col px-6 py-16 lg:py-0">
      <div className="flex justify-end pt-4 lg:pt-8">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center">
      <div className="relative z-10 flex w-full flex-col gap-16 lg:flex-row lg:items-center lg:gap-24">
        {/* Left: copy */}
        <div className="flex flex-col lg:flex-1">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-medium tracking-widest text-primary uppercase">
              Verdict
            </span>
          </div>

          <h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-[5.5rem]">
            <span className="text-foreground">Honest college</span>
            <br />
            <span className="text-gradient">admissions</span>
            <br />
            <span className="text-foreground/80">predictions.</span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            A simulated admissions committee across{" "}
            <span className="text-foreground font-medium">150+ US colleges</span>.
            Explainable, research-grounded reads on your chances — not a Reddit thread.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--safety)]" />
              Free
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--target)]" />
              5-minute profile
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--reach)]" />
              No account required
            </span>
          </div>
        </div>

        {/* Right: path cards */}
        <div className="flex flex-col gap-4 lg:w-80">
          <Link
            href="/apply?path=recent"
            className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--safety)]/50 hover:shadow-[0_20px_40px_-15px_var(--safety),0_0_30px_-8px_var(--safety)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--safety)]/0 to-[var(--safety)]/0 transition-all duration-300 group-hover:from-[var(--safety)]/5 group-hover:to-transparent" />
            <span className="relative text-xs uppercase tracking-[0.15em] text-[var(--safety)]">
              Traditional
            </span>
            <div className="relative">
              <p className="font-serif text-xl text-foreground">Recent Graduate</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Currently in high school or graduated within the last two years.
              </p>
            </div>
            <ArrowRight className="relative size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-[var(--safety)]" />
          </Link>

          <Link
            href="/apply?path=returning"
            className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--target)]/50 hover:shadow-[0_20px_40px_-15px_var(--target),0_0_30px_-8px_var(--target)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--target)]/0 to-[var(--target)]/0 transition-all duration-300 group-hover:from-[var(--target)]/5 group-hover:to-transparent" />
            <span className="relative text-xs uppercase tracking-[0.15em] text-[var(--target)]">
              Non-traditional
            </span>
            <div className="relative">
              <p className="font-serif text-xl text-foreground">Adult Learner</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Graduated years ago and ready to start or return to undergrad.
              </p>
            </div>
            <ArrowRight className="relative size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-[var(--target)]" />
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
}
