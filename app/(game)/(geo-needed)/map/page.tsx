import { Suspense } from "react";

import { getNodes } from "@/lib/api-helpers/server/nodes";
import { MobileMapView } from "./_components/mobile-map-view";

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

export default async function MapPage() {
  const nodes = await getNodes();

  return (
    <div className="h-screen w-full relative">
      <Suspense
        fallback={<div className="h-full w-full bg-muted animate-pulse" />}
      >
        <MobileMapView nodes={nodes} />
      </Suspense>
    </div>
  );
}
