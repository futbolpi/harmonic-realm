import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import LoreStakeDetailClient from "./_components/stake-detail-client";

interface StakeDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const StakeDetailPage = async ({ params }: StakeDetailProps) => {
  const id = (await params).id;

  const stake = await prisma.locationLoreStake.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      targetLevel: true,
      paymentStatus: true,
      nodeId: true,
      userId: true,
      contributionTier: true,
      piAmount: true,
      locationLore: {
        select: {
          node: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!stake) {
    notFound();
  }

  return (
    <LoreStakeDetailClient
      stake={{ ...stake, piAmount: stake.piAmount.toNumber() }}
    />
  );
};

export default StakeDetailPage;
