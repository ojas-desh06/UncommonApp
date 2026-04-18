import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
    </main>
  );
}
