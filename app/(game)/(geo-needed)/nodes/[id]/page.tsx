import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getNode } from "@/lib/api-helpers/server/nodes";
import { NodeDetailClient } from "./_components/node-detail-client";

type NodeDetailsPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: NodeDetailsPageProps) {
  const node = await getNode((await params).id);

  if (!node) {
    return {
      title: "Echo Guardian Node Not Found - HarmonicRealm",
      description:
        "The requested Echo Guardian Node could not be found in the cosmic Lattice.",
    };
  }

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
            `Earn ${node.type.baseYieldPerMinute} Shares per minute`
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
          `Earn ${node.type.baseYieldPerMinute} Shares per minute`
        )}&type=node&nodeType=${encodeURIComponent(node.type.name)}`,
      ],
    },
  };
}

export default async function NodeDetailsPage({
  params,
}: NodeDetailsPageProps) {
  const id = (await params).id;
  const node = await getNode(id);

  if (!node) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={<div className="h-full bg-background animate-pulse" />}
      >
        <NodeDetailClient node={node} />
      </Suspense>
    </div>
  );
}
