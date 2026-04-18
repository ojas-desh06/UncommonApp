import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="w-full border-t border-border/50 py-24 sm:py-32">
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-64 w-96 rounded-full bg-primary/8 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            Ready to know where you stand?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            No account. No credit card. Just your profile and an honest answer.
          </p>
          <div className="mt-9">
            <Link
              href="/apply"
              className={cn(buttonVariants({ size: "lg" }), "group gap-2 px-8 btn-shimmer")}
            >
              Get your verdict
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
