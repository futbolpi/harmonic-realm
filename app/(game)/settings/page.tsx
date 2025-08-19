import type { Metadata } from "next";

import { SettingsClient } from "./_components/settings-client";

export const metadata: Metadata = {
  title: "Harmonic Calibration | HarmonicRealm",
  description:
    "Calibrate your resonance frequency and customize your Pioneer interface within the cosmic Lattice.",
  openGraph: {
    title: "Harmonic Calibration - Customize Your Pioneer Experience",
    description:
      "Fine-tune your connection to the cosmic Lattice and personalize your journey through HarmonicRealm.",
    images: [
      {
        url: "/api/og?title=Harmonic Calibration&subtitle=Customize Your Pioneer Experience&type=settings",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Settings - Harmonic Calibration Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harmonic Calibration | HarmonicRealm",
    description:
      "Calibrate your resonance frequency and customize your Pioneer interface.",
    images: [
      "/api/og?title=Harmonic Calibration&subtitle=Customize Your Pioneer Experience&type=settings",
    ],
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
