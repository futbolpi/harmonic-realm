import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getNode } from "@/lib/api-helpers/server/nodes";
import { NodeDetailClient } from "./_components/node-detail-client";

type NodeDetailsPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: NodeDetailsPageProps) {
  const id = (await params).id;
  const node = await getNode(id);

  if (!node) {
    return {
      title: "Node Not Found",
    };
  }

  return {
    title: `${node.type.name} - Mining Node`,
    description: `Mine Pi cryptocurrency at this ${node.type.name} node. Earn ${node.type.baseYieldPerMinute}π per minute with ${node.type.lockInMinutes} minute lock-in time.`,
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
        fallback={<div className="h-screen bg-background animate-pulse" />}
      >
        <NodeDetailClient node={node} />
      </Suspense>
    </div>
  );
}
