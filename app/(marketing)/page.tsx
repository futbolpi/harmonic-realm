import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { HowItWorks } from "./_components/how-it-works";
import { CTA } from "./_components/cta";

export const metadata = {
  title: "HarmonicRealm - Resonate with the Cosmic Lattice",
  description:
    "Join the Pioneers in discovering Echo Guardians, mining Shares from the infinite Pi digits, and awakening the Harmonic frequencies that bind our reality.",
  openGraph: {
    title: "HarmonicRealm - Resonate with the Cosmic Lattice",
    description:
      "Join the Pioneers in discovering Echo Guardians, mining Shares from the infinite Pi digits, and awakening the Harmonic frequencies that bind our reality.",
    images: [
      {
        url: "/api/og?title=HarmonicRealm&description=Join the Pioneers in discovering Echo Guardians&type=default",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm - Cosmic Lattice Exploration",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HarmonicRealm - Resonate with the Cosmic Lattice",
    description:
      "Join the Pioneers in discovering Echo Guardians, mining Shares from the infinite Pi digits, and awakening the Harmonic frequencies that bind our reality.",
    images: [
      "/api/og?title=HarmonicRealm&description=Join the Pioneers in discovering Echo Guardians&type=default",
    ],
  },
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
