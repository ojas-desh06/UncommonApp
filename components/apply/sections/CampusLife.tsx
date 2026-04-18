"use client";

import { Controller, useFormContext, FieldValues, Path } from "react-hook-form";
import { SectionHeader } from "../Field";

type PillGroupProps<TForm extends FieldValues, T extends string> = {
  label: string;
  name: Path<TForm>;
  options: { value: T; label: string }[];
};

function PillGroup<TForm extends FieldValues, T extends string>({ label, name, options }: PillGroupProps<TForm, T>) {
  const { control } = useFormContext<TForm>();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-foreground/90">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const selected = field.value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground/70 hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      />
    </div>
  );
}

export function CampusLifeSection({ step = 6 }: { step?: number }) {
  return (
    <section>
      <SectionHeader
        step={step}
        title="Campus Life"
        blurb="Tell us what kind of environment you're looking for — we'll factor this into your fit scores."
      />
      <div className="flex flex-col gap-6">
        <PillGroup
          label="Campus setting"
          name="campus_setting"
          options={[
            { value: "city", label: "🏙 City" },
            { value: "suburban", label: "🏘 Suburban" },
            { value: "rural", label: "🌲 Rural / College town" },
            { value: "any", label: "No preference" },
          ]}
        />

        <PillGroup
          label="Sports culture"
          name="sports_culture"
          options={[
            { value: "big_sports", label: "🏈 Big sports school" },
            { value: "moderate", label: "⚽ Some sports, not everything" },
            { value: "not_important", label: "Not important to me" },
          ]}
        />

        <PillGroup
          label="Greek life"
          name="greek_life"
          options={[
            { value: "important", label: "Very important" },
            { value: "nice_to_have", label: "Nice to have" },
            { value: "not_interested", label: "Not interested" },
          ]}
        />

        <PillGroup
          label="Research opportunities"
          name="research"
          options={[
            { value: "essential", label: "Essential" },
            { value: "nice_to_have", label: "Nice to have" },
            { value: "not_important", label: "Not important" },
          ]}
        />

        <PillGroup
          label="Weather preference"
          name="weather"
          options={[
            { value: "warm", label: "☀️ Warm / Sunny" },
            { value: "four_seasons", label: "🍂 Four seasons" },
            { value: "cold", label: "❄️ Cold is fine" },
            { value: "any", label: "No preference" },
          ]}
        />

        <PillGroup
          label="Campus diversity"
          name="diversity"
          options={[
            { value: "very_important", label: "Very important" },
            { value: "somewhat", label: "Somewhat important" },
            { value: "not_a_factor", label: "Not a deciding factor" },
          ]}
        />
      </div>
    </section>
  );
}
