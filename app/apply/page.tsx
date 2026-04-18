import Link from "next/link";
import { StudentForm } from "@/components/apply/StudentForm";

export const metadata = {
  title: "Build your profile — Verdict",
};

export default function ApplyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12 flex items-baseline justify-between">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-foreground"
          >
            Verdict
          </Link>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Profile
          </span>
        </header>
        <div className="mb-10">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Build your profile.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Five sections. About five minutes. Everything stays on this device
            unless you ask us to save it.
          </p>
        </div>
        <StudentForm />
      </div>
    </main>
  );
}
