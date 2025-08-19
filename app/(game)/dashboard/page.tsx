import { getSiteStats } from "@/lib/api-helpers/server/site";
import DashboardClientPage from "./_components/dashboard-client-page";

export const metadata = {
  title: "Resonance Hub - HarmonicRealm Pioneer Command",
  description:
    "Your personal resonance hub reflecting harmony with the cosmic Lattice. Monitor Share earnings, track XP progression, and view global phase advancement toward the next Harmonic Awakening.",
  openGraph: {
    title: "Resonance Hub - HarmonicRealm Pioneer Command",
    description:
      "Your personal resonance hub reflecting harmony with the cosmic Lattice. Monitor Share earnings, track XP progression, and view global phase advancement toward the next Harmonic Awakening.",
    images: [
      {
        url: "/api/og?title=Resonance Hub&description=Your harmony with the cosmic Lattice&type=dashboard",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Resonance Hub",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resonance Hub - HarmonicRealm Pioneer Command",
    description:
      "Your personal resonance hub reflecting harmony with the cosmic Lattice. Monitor Share earnings, track XP progression, and view global phase advancement toward the next Harmonic Awakening.",
    images: [
      "/api/og?title=Resonance Hub&description=Your harmony with the cosmic Lattice&type=dashboard",
    ],
  },
};

export default async function DashboardPage() {
  const { latestPhase, sessionsCompleted } = await getSiteStats();

  return (
    <DashboardClientPage
      currentPhase={latestPhase?.phaseNumber || 1}
      sessionsCompleted={sessionsCompleted}
    />
  );
}
