import { Hero } from "./_components/hero";
import { VideoSection } from "./_components/video-section";
import { Features } from "./_components/features";
import { HowItWorks } from "./_components/how-it-works";
import { FOMOSection } from "./_components/fomo-section";
import { CTA } from "./_components/cta";

export const revalidate = 3600; // Revalidate every hour for fresh stats

export default function HomePage() {
  return (
    <>
      <Hero />
      <VideoSection />
      <Features />
      <HowItWorks />
      <FOMOSection />
      <CTA />
    </>
  );
}
