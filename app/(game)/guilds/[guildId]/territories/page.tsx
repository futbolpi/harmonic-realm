import GuildTerritoriesClient from "./_components/guild-territories-client";
import {
  getGuildTerritories,
  getGuildTerritoryStats,
  getGuildChallenges,
} from "./services";

export async function generateMetadata() {
  return {
    title: `Guild Territories | Territory Control System`,
    description:
      "Manage your guild's territories, view active wars, and stake new zones",
  };
}

export default async function GuildTerritoriesPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const [territories, stats, challenges] = await Promise.all([
    getGuildTerritories(guildId),
    getGuildTerritoryStats(guildId),
    getGuildChallenges(guildId),
  ]);

  return (
    <GuildTerritoriesClient
      guildId={guildId}
      initialTerritories={territories}
      initialStats={stats}
      initialChallenges={challenges}
    />
  );
}
