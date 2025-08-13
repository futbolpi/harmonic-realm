import { Suspense } from "react";

import { getNodes } from "@/lib/api-helpers/server/nodes";
import { MobileMapView } from "./_components/mobile-map-view";

export const metadata = {
  title: "Mining Map - Pi Mining Nodes",
  description:
    "Explore nearby mining nodes and start earning Pi cryptocurrency through location-based gameplay.",
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
