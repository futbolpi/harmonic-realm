import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { getDriftOpportunities } from "@/lib/api-helpers/server/drifts/get-eligible-nodes";
import { ResonantDriftClient } from "./_components/resonant-drift-client";

// ============================================================================
// RESONANT DRIFT PAGE
// ============================================================================

export const metadata = {
  title: "Resonant Drift - Summon Dormant Nodes",
  description:
    "Summon dormant nodes to your vicinity with the enhanced Drift system. Featuring density-based eligibility, graduated discounts, and improved accessibility for rural players.",
  openGraph: {
    title: "Resonant Drift - Summon Dormant Nodes",
    description:
      "Enhanced drift system with 50-95% cost reductions, graduated discounts for new players, and density-based eligibility zones.",
    images: [
      {
        url: "/api/og?title=Resonant Drift&description=Summon dormant nodes to your area&type=drift",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Resonant Drift",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resonant Drift - Summon Dormant Nodes",
    description:
      "Enhanced drift system with 50-95% cost reductions and improved rural player accessibility.",
    images: [
      "/api/og?title=Resonant Drift&description=Summon dormant nodes&type=drift",
    ],
  },
};

export const revalidate = 3600; // 1 hour

export default async function ResonantDriftPage() {
  // Fetch all eligible drift nodes (excluding Surge nodes)
  const driftOpportunities = await getDriftOpportunities();

  return (
    <div className="h-[calc(100vh-8rem)] w-full relative">
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading drift opportunities...
              </p>
            </div>
          </div>
        }
      >
        <ResonantDriftClient initialNodes={driftOpportunities} />
      </Suspense>
    </div>
  );
}
