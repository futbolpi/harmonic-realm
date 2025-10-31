import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import ContributionDetailClient from "./_components/contribution-detail-client";

interface ContributionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

const ContributionDetailPage = async ({
  params,
}: ContributionDetailPageProps) => {
  const id = (await params).id;

  const contribution = await prisma.awakeningContribution.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      gamePhaseId: true,
      piContributed: true,
      contributionTier: true,
      latitudeBin: true,
      longitudeBin: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  if (!contribution) {
    notFound();
  }

  return (
    <ContributionDetailClient
      contribution={{
        ...contribution,
        piContributed: contribution.piContributed.toNumber(),
      }}
    />
  );
};

export default ContributionDetailPage;
