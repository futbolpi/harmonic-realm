import { Suspense } from "react";

import { getNodes } from "@/lib/api-helpers/server/nodes";
import { MapSkeleton } from "./_components/map-skeleton";
import { InteractiveMapGL } from "./_components/interactive-map-gl";

export const metadata = {
  title: "Mining Map - Pi Mining Nodes",
  description:
    "Explore nearby mining nodes and start earning Pi cryptocurrency through location-based gameplay.",
};

export default async function MapPage() {
  const nodes = await getNodes();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Mining Map</h1>
          <p className="text-muted-foreground">
            Discover and explore mining nodes in your area. Click on any node to
            view details and start mining.
          </p>
        </div>

        {/* Map Container */}
        <div className="h-[calc(100vh-200px)] min-h-[600px]">
          <Suspense fallback={<MapSkeleton />}>
            <InteractiveMapGL nodes={nodes} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
