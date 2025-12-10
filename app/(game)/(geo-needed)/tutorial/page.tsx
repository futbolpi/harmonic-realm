import { Suspense } from "react";

import { EPHEMERAL_SPARK_NODE } from "@/config/tutorial";
import { TutorialClient } from "./_components/tutorial-client";

export async function generateMetadata() {
  const node = EPHEMERAL_SPARK_NODE;

  const title = `${node.type.name} Echo Guardian - Harmonic Resonance Node`;
  const description = `Resonate with this ${node.type.name} Echo Guardian to earn ${node.type.baseYieldPerMinute} Shares per minute. Lock-in time: ${node.type.lockInMinutes} minutes. Rarity level: ${node.type.rarity}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            node.type.name + " Echo Guardian"
          )}&description=${encodeURIComponent(
            `Earn ${node.type.baseYieldPerMinute.toFixed(1)} Shares per minute`
          )}&type=node&nodeType=${encodeURIComponent(node.type.name)}`,
          width: 1200,
          height: 630,
          alt: `${node.type.name} Echo Guardian Node - HarmonicRealm`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `/api/og?title=${encodeURIComponent(
          node.type.name + " Echo Guardian"
        )}&description=${encodeURIComponent(
          `Earn ${node.type.baseYieldPerMinute.toFixed(1)} Shares per minute`
        )}&type=node&nodeType=${encodeURIComponent(node.type.name)}`,
      ],
    },
  };
}

export default async function NodeDetailsPage() {
  const node = EPHEMERAL_SPARK_NODE;

  return (
    <div className="h-[calc(100vh-8rem)] md:h-screen bg-background">
      <Suspense
        fallback={<div className="h-full bg-background animate-pulse" />}
      >
        <TutorialClient node={node} />
      </Suspense>
    </div>
  );
}
