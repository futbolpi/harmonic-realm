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
              totalSharePoints={guild.totalSharePoints}
              vaultBalance={guild.vaultBalance}
              totalTerritories={guild._count.territories}
            />

            {/* Active Challenges */}
            {/* <Card>
              <CardHeader>
                <CardTitle>
                  Active Challenges ({guild.activeChallenges.length}/4 Active)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guild.activeChallenges.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No active challenges
                  </p>
                )}

                {guild.activeChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <div>
                          <p className="font-semibold">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.current.toLocaleString()} /{" "}
                            {c.target.toLocaleString()} • {c.endsIn} left
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        💎 {c.rewardRes} • ⭐ {c.rewardPrestige}
                      </div>
                    </div>
                    <Progress value={c.progress} className="h-2 rounded-full" />
                  </div>
                ))}

                <div>
                  <Link href="#" className="text-sm text-primary">
                    View All Challenges →
                  </Link>
                </div>
              </CardContent>
            </Card> */}

            {/* Territories */}
            <Suspense fallback={<TerritoriesCardLoading />}>
              <TerritoriesCard guildId={guildId} />
            </Suspense>

            {/* Artifacts */}
            {/* <Card>
              <CardHeader>
                <CardTitle>
                  Equipped Artifacts ({guild.artifacts.length}/3 Slots)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {guild.artifacts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 w-40 rounded-lg border border-border bg-card"
                    >
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Lv {a.level}
                      </p>
                      <p className="text-xs mt-2">{a.effect}</p>
                    </div>
                  ))}
                  {guild.artifacts.length < 3 && (
                    <div className="p-3 w-40 rounded-lg border-dashed border border-border bg-card/50 flex items-center justify-center">
                      [+]
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <Link href="#" className="text-sm text-primary">
                    Manage Artifacts →
                  </Link>
                </div>
              </CardContent>
            </Card> */}
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
