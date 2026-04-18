import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
      {/* Radial glow behind headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[480px] w-[680px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Link
          href="/apply"
          className="mb-5 inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-foreground"
        >
          Verdict
        </Link>

        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-[5rem]">
          Honest college
          <br />
          admissions predictions.
        </h1>

        <p className="mt-7 max-w-lg text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          A simulated admissions committee across 150+ US colleges. Explainable,
          research-grounded reads on your chances — not a Reddit thread.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/apply"
            className={cn(buttonVariants({ size: "lg" }), "group gap-2 px-7 btn-shimmer")}
          >
            Get your verdict
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="mt-7 text-xs text-muted-foreground/60 tracking-wide">
          Free · 5-minute profile · No account required
        </p>
      </div>
    </section>
  );
}
