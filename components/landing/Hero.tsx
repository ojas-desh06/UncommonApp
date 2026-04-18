import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Verdict
      </div>
      <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
        Honest college
        <br />
        admissions predictions.
      </h1>
      <p className="mt-8 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
        A simulated admissions committee across 150+ US colleges. Explainable,
        research-grounded reads on your chances — not a Reddit thread.
      </p>
      <div className="mt-10">
        <Link
          href="/apply"
          className={cn(buttonVariants({ size: "lg" }), "group")}
        >
          Get your verdict
          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted-foreground/70">
        Free · 5-minute profile · No account required
      </p>
    </section>
  );
}
