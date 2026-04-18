const steps = [
  {
    step: "01",
    title: "Build your profile",
    description:
      "Enter your GPA, test scores, activities, awards, and preferences. Takes about 5 minutes.",
  },
  {
    step: "02",
    title: "Run the committee",
    description:
      "Our model simulates how a real admissions committee weighs your full application across every school.",
  },
  {
    step: "03",
    title: "Get your verdict",
    description:
      "Receive a tiered college list with honest chances, confidence ranges, and plain-English feedback.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
            Three steps from blank form to a college list you can actually trust.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-3">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="absolute top-6 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] hidden h-px bg-border sm:block"
          />

          {steps.map(({ step, title, description }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold tabular-nums text-muted-foreground">
                {step}
              </div>
              <h3 className="mb-2 font-sans text-sm font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
