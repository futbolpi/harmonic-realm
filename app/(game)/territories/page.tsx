import { Suspense } from "react";

import { getTerritoriesForMap } from "@/lib/api-helpers/server/guilds/territories-map";
import TerritoriesMapClient from "./_components/territories-map-client";
import { metadata as mapMetadata } from "../map/page";

export const metadata = {
  ...mapMetadata,
  title: "Territories - Cosmic Lattice",
  description:
    "Manage territory control: claim hexes, challenge guilds, and stake RESONANCE.",
};

export const revalidate = 3600;

export default async function TerritoriesPage() {
  const territories = await getTerritoriesForMap();

  return (
    <div className="h-[calc(100vh-8rem)] w-full relative flex">
      <div className="w-full relative">
        <Suspense
          fallback={<div className="h-full w-full bg-muted animate-pulse" />}
        >
          {/* Client-side map component */}
          <TerritoriesMapClient initialTerritories={territories} />
        </Suspense>
      </div>
    </div>
  );
}
