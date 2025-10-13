import { Suspense } from "react";

import { getNodes } from "@/lib/api-helpers/server/nodes";
import { getSiteStats } from "@/lib/api-helpers/server/site";
import { GENESIS_THRESHOLD } from "@/config/site";
import { MobileMapView } from "./_components/mobile-map-view";
import { GenesisCountdown } from "./_components/genesis-countdown";

export const metadata = {
  title: "Cosmic Lattice Map - Discover Echo Guardian Nodes",
  description:
    "Explore the mystical Lattice grid to discover Echo Guardian Nodes, initiate harmonic resonance sessions, and collect Lore Fragments across the cosmic realm.",
  openGraph: {
    title: "Cosmic Lattice Map - Discover Echo Guardian Nodes",
    description:
      "Explore the mystical Lattice grid to discover Echo Guardian Nodes, initiate harmonic resonance sessions, and collect Lore Fragments across the cosmic realm.",
    images: [
      {
        url: "/api/og?title=Cosmic Lattice Map&description=Discover Echo Guardian Nodes across the mystical realm&type=map",
        width: 1200,
        height: 630,
        alt: "HarmonicRealm Cosmic Lattice Map",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmic Lattice Map - Discover Echo Guardian Nodes",
    description:
      "Explore the mystical Lattice grid to discover Echo Guardian Nodes, initiate harmonic resonance sessions, and collect Lore Fragments across the cosmic realm.",
    images: [
      "/api/og?title=Cosmic Lattice Map&description=Discover Echo Guardian Nodes across the mystical realm&type=map",
    ],
  },
};

export const revalidate = 3600;

export default async function MapPage() {
  const [nodes, siteStats] = await Promise.all([getNodes(), getSiteStats()])

  const isPreGenesis = nodes.length === 0
  const currentHarmonizers = siteStats.pioneersAggregate._count.id 
  const requiredHarmonizers = GENESIS_THRESHOLD 

  return (
    <div className="h-[calc(100vh-8rem)] w-full relative">
      <Suspense
        fallback={<div className="h-full w-full bg-muted animate-pulse" />}
      >
        {isPreGenesis ? (
          <GenesisCountdown
            currentHarmonizers={currentHarmonizers}
            requiredHarmonizers={requiredHarmonizers}
          />
        ) : (
          <MobileMapView nodes={nodes} />
        )}
      </Suspense>
    </div>
  );
}
