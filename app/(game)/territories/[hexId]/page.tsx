import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getTerritoryDetail, getTerritoryDetailMeta } from "./services";
import { formatTerritoryDetail } from "./utils";
import TerritoryDetailClient from "./_components/territory-detail-client";

interface Props {
  params: Promise<{ hexId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hexId } = await params;

  try {
    const territory = await getTerritoryDetailMeta(hexId);
    if (!territory) return {};

    const title = territory.guild
      ? `${territory.guild.name}'s Territory`
      : `Unclaimed Territory ${hexId}`;
    return {
      title,
      description: `Territory with ${
        territory._count.nodes
      } nodes and traffic score of ${Math.round(territory.trafficScore)}`,
    };
  } catch {
    return {};
  }
}

export default async function TerritoryDetailPage({ params }: Props) {
  const { hexId } = await params;

  const territory = await getTerritoryDetail(hexId);

  if (!territory) {
    notFound();
  }

  const formattedTerritory = formatTerritoryDetail(territory);

  return (
    <div className="min-h-screen bg-background">
      <TerritoryDetailClient territory={formattedTerritory} />
    </div>
  );
}
