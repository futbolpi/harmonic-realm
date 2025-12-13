import { Suspense } from "react";

import { getDriftOpportunities } from "@/lib/api-helpers/server/drifts/get-eligibile-nodes";
import { ResonantDriftClient } from "./_components/resonant-drift-client";

export const metadata = {
  title: "Resonant Drift - Explore Dimensional Nodes",
  description:
    "Explore the dimensional void to discover and drift to resonant nodes beyond the 10km safe zone. Locate rare Drift Opportunities across the cosmic realm.",
  openGraph: {
    title: "Resonant Drift - Explore Dimensional Nodes",
    description:
      "Explore the dimensional void to discover and drift to resonant nodes beyond the 10km safe zone.",
    images: [
      {
        url: "/api/og?title=Resonant Drift&description=Explore dimensional nodes beyond the safe zone&type=drift",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Resonant Drift",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resonant Drift - Explore Dimensional Nodes",
    description:
      "Explore the dimensional void to discover and drift to resonant nodes beyond the 10km safe zone.",
    images: [
      "/api/og?title=Resonant Drift&description=Explore dimensional nodes beyond the safe zone&type=drift",
    ],
  },
};

export const revalidate = 3600;

export default async function ResonantDriftPage() {
  const driftOpportunities = await getDriftOpportunities();

  return (
    <div className="h-[calc(100vh-8rem)] w-full relative">
      <Suspense
        fallback={<div className="h-full w-full bg-muted animate-pulse" />}
      >
        <ResonantDriftClient initialNodes={driftOpportunities} />
      </Suspense>
    </div>
  );
}
