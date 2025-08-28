import LoreStakeDetailClient from "./_components/stake-detail-client";

interface StakeDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const StakeDetailPage = async ({ params }: StakeDetailProps) => {
  const stakeId = (await params).id;

  return <LoreStakeDetailClient stakeId={stakeId} />;
};

export default StakeDetailPage;
