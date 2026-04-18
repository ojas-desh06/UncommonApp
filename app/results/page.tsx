import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPrediction } from "@/lib/prediction-cache";
import { ResultsView } from "@/components/results/ResultsView";

export const metadata = {
  title: "Your verdict — Verdict",
};

type SearchParams = Promise<{ id?: string | string[] }>;

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const prediction = id ? getPrediction(id) : undefined;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <header className="mb-10 flex items-baseline justify-between">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-foreground"
          >
            Verdict
          </Link>
          <Link
            href="/apply"
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            Edit profile
          </Link>
        </header>

        {!prediction ? (
          <SessionExpired />
        ) : (
          <>
            <section className="mb-10 max-w-3xl">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Verdict
              </div>
              <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                {prediction.headline}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Click any school on the map or in the list for the full read.
              </p>
            </section>
            <ResultsView prediction={prediction} />
          </>
        )}
      </div>
    </main>
  );
}

function SessionExpired() {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-lg border border-border bg-card/40 p-8 text-center">
      <h1 className="font-serif text-2xl text-foreground">
        Session expired
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your verdict lives in memory for this session only. Rebuild your profile
        to get a fresh read — it takes about five minutes.
      </p>
      <div className="mt-6">
        <Link href="/apply" className={cn(buttonVariants())}>
          Start over
        </Link>
      </div>
    </div>
  );
}
