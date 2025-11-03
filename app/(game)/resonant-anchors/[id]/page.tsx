import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import ResonantAnchorDetailClient from "./_components/resonant-anchor-detail-client";

interface ResonantAnchorDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

/**
 * Resonant anchor detail page for payment completion
 */
const ResonantAnchorDetailPage = async ({
  params,
}: ResonantAnchorDetailPageProps) => {
  const id = (await params).id;

  const resonantAnchor = await prisma.resonantAnchor.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      phaseId: true,
      locationLat: true,
      locationLon: true,
      piCost: true,
      paymentStatus: true,
      nodeId: true,
      createdAt: true,
    },
  });

  if (!resonantAnchor) {
    notFound();
  }

  return <ResonantAnchorDetailClient anchor={resonantAnchor} />;
};

export default ResonantAnchorDetailPage;
