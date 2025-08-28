import { Suspense } from "react";

import { NodeLoreLoading } from "./_components/node-lore-loading";
import { NodeLoreDetails } from "./_components/node-lore-details";

interface NodeLorePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NodeLorePage({ params }: NodeLorePageProps) {
  const nodeId = (await params).id;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<NodeLoreLoading />}>
        <NodeLoreDetails nodeId={nodeId} />
      </Suspense>
    </div>
  );
}
