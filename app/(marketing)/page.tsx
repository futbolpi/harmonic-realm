import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { HowItWorks } from "./_components/how-it-works";
import { CTA } from "./_components/cta";

export const metadata = {
  title: "Pi Mining Nodes - Turn Exploration into Pi Mining Adventure",
  description:
    "Discover real-world nodes, mine Pi cryptocurrency, and earn rewards through location-based gameplay. Join the Pi Network mining revolution.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </>
  );
}
