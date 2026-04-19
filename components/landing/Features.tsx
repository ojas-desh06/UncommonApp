import { BarChart2, BookOpen, MapPin, ShieldCheck, Sliders, Users } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Simulated committee",
    description:
      "We model the full admissions committee process, not just a score lookup table.",
  },
  {
    icon: BarChart2,
    title: "150+ colleges covered",
    description:
      "From Ivies and LACs to strong state flagships — every tier of the US college landscape.",
  },
  {
    icon: ShieldCheck,
    title: "Research-grounded",
    description:
      "Built on published acceptance data, yield curves, and holistic review rubrics.",
  },
  {
    icon: Sliders,
    title: "Fully explainable",
    description:
      "Every prediction comes with exactly what's working for you, against you, and what would help.",
  },
  {
    icon: MapPin,
    title: "Regional awareness",
    description:
      "Geographic diversity factors baked in — where you're from matters, and we account for it.",
  },
  {
    icon: BookOpen,
    title: "No account needed",
    description:
      "Fill out a 5-minute profile and get your full list instantly. No sign-up, no spam.",
  },
];

export function Features() {
  return (
    <section className="w-full border-t border-border/50 bg-muted/20 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            What&apos;s in Verdict
          </h2>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need to build a smart, honest college list — in one place.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <button
              key={title}
              type="button"
              className="group cursor-pointer rounded-xl border border-border/60 bg-card p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_20px_40px_-15px_oklch(0_0_0/0.5)]"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
                <Icon className="size-5" />
              </div>
              <h3 className="mb-2 font-sans text-sm font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
