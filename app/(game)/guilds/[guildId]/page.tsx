import { Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "./_components/header";
import Stats from "./_components/stats";
import TopContributors from "./_components/top-contributors";
import RecentActivity from "./_components/recent-activity";
import RecentActivityFallback from "./_components/recent-activity-loading";
import { getGuildDetailsData } from "./services";
import TerritoriesCard from "./_components/territories-card";
import TerritoriesCardLoading from "./_components/territories-card-loading";
import ActiveChallenges from "./_components/active-challenges";
import ArtifactsCard from "./_components/artifacts-card";
import ArtifactsCardLoading from "./_components/artifacts-card-loading";

type Props = {
  params: Promise<{ guildId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { guildId } = await params;
  const guild = await getGuildDetailsData(guildId);

  if (!guild) return { title: "Guild" };

  return {
    title: `${guild.name} — Guild`,
    description: `Guild ${guild.name} [${guild.tag}] led by ${guild.leaderUsername}. Vault level ${guild.vaultLevel}.`,
  };
}

export default async function GuildPage({ params }: Props) {
  const { guildId } = await params;

  const guild = await getGuildDetailsData(guildId);
  if (!guild) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <Header
          guild={{
            activeMembers: guild._count.members,
            piTransactionId: guild.piTransactionId,
            emblem: guild.emblem,
            id: guildId,
            leaderUsername: guild.leaderUsername,
            maxMembers: guild.maxMembers,
            name: guild.name,
            tag: guild.tag,
            vaultLevel: guild.vaultLevel,
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats horizontal */}
            <Stats
              prestigeLevel={guild.prestigeLevel}
              vaultBalance={guild.vaultBalance}
              totalTerritories={guild._count.territories}
            />

            {/* Active Challenges */}
            <ActiveChallenges
              activeChallenges={guild.challengeHistory}
              guildId={guildId}
            />

            {/* Territories */}
            <Suspense fallback={<TerritoriesCardLoading />}>
              <TerritoriesCard guildId={guildId} />
            </Suspense>

            {/* Artifacts */}
            <Suspense fallback={<ArtifactsCardLoading />}>
              <ArtifactsCard guildId={guildId} />
            </Suspense>
          </div>

          <aside className="space-y-6">
            {/* Stream recent activity separately to avoid blocking the rest of the page */}
            <Suspense fallback={<RecentActivityFallback />}>
              <RecentActivity
                guildId={guildId}
                piTransactionId={guild.piTransactionId}
              />
            </Suspense>

            <TopContributors
              guildId={guildId}
              topContributors={guild.members}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
