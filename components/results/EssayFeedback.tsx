"use client";

import { useState } from "react";
import type { Prediction } from "@/lib/types";
import { Lightbulb, Quote, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type EssayFeedback = NonNullable<Prediction["essay_feedback"]>;

const DIMENSIONS: {
  key: keyof Pick<EssayFeedback, "overall" | "authenticity" | "specificity" | "narrative">;
  label: string;
}[] = [
  { key: "overall", label: "Overall" },
  { key: "authenticity", label: "Authenticity" },
  { key: "specificity", label: "Specificity" },
  { key: "narrative", label: "Narrative" },
];

function scoreColor(score: number): string {
  if (score >= 8) return "var(--safety)";
  if (score >= 6) return "var(--target)";
  if (score >= 4) return "var(--reach)";
  return "var(--hard-reach)";
}

function ScoresDisplay({ feedback }: { feedback: EssayFeedback }) {
  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DIMENSIONS.map(({ key, label }) => {
          const score = feedback[key];
          const color = scoreColor(score);
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold" style={{ color }}>{score}/10</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${score * 10}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 8px ${color}50`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-5 flex gap-3 rounded-lg border border-border bg-background/50 p-4">
        <Quote className="mt-0.5 size-4 shrink-0 text-primary/60" />
        <p className="text-sm leading-relaxed text-foreground/85 italic">{feedback.summary}</p>
      </div>

      {feedback.tips && feedback.tips.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2" style={{ color: "var(--reach)" }}>
            <Lightbulb className="size-4" />
            <h3 className="text-xs font-semibold uppercase tracking-widest">Tips to improve</h3>
          </div>
          <ul className="flex flex-col gap-3">
            {feedback.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: "color-mix(in oklch, var(--reach) 15%, transparent)", color: "var(--reach)" }}
                >
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function EssayFeedback({
  initialFeedback,
  studentEssay,
}: {
  initialFeedback?: EssayFeedback;
  studentEssay?: string;
}) {
  const [feedback, setFeedback] = useState<EssayFeedback | null>(initialFeedback ?? null);
  const [essay, setEssay] = useState(studentEssay ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (essay.trim().length < 50) {
      setError("Please enter at least 50 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setFeedback(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 rounded-xl border border-border bg-card/40 p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-glow" />
        <h2 className="font-serif text-xl text-foreground">Essay Analysis</h2>
        <span className="ml-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          AI
        </span>
      </div>

      {feedback ? (
        <>
          <ScoresDisplay feedback={feedback} />
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="mt-5 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Re-analyze with a different essay
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
            <FileText className="mt-0.5 size-4 shrink-0" />
            <span>
              {studentEssay
                ? "Your essay wasn't analyzed automatically. Paste it below and click Grade."
                : "Paste your personal statement below to get an AI score and improvement tips."}
            </span>
          </div>

          <textarea
            rows={8}
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your college essay here…"
            className="w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button onClick={analyze} disabled={loading} className="w-full sm:w-auto sm:self-start">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Grading…
              </>
            ) : (
              "Grade my essay"
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
