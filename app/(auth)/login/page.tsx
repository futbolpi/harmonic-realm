import { Suspense } from "react";

import AuthLoading from "@/components/shared/auth/auth-loading";
import LoginPageClient from "../_components/login-page-client";

export const metadata = {
  title: "Begin Harmonic Resonance - HarmonicRealm Login",
  description:
    "Connect to the cosmic Lattice through Pi Network and begin your Pioneer journey through HarmonicRealm's mystical exploration.",
  openGraph: {
    title: "Begin Harmonic Resonance - HarmonicRealm Login",
    description:
      "Connect to the cosmic Lattice through Pi Network and begin your Pioneer journey through HarmonicRealm's mystical exploration.",
    images: [
      {
        url: "/api/og?title=Begin Your Pioneer Journey&description=Connect to the cosmic Lattice through Pi Network&type=login",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Login - Begin Harmonic Resonance",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Begin Harmonic Resonance - HarmonicRealm Login",
    description:
      "Connect to the cosmic Lattice through Pi Network and begin your Pioneer journey through HarmonicRealm's mystical exploration.",
    images: [
      "/api/og?title=Begin Your Pioneer Journey&description=Connect to the cosmic Lattice through Pi Network&type=login",
    ],
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginPageClient />;
    </Suspense>
  );
}
