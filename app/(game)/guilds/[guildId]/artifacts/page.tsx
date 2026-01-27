import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getGuildArtifactsData } from "./services";
import ArtifactCard from "./_components/artifact-card";
import AvailableTemplates from "./_components/available-templates";
import ArtifactsStats from "./_components/artifacts-stats";

type Props = {
  params: Promise<{ guildId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { guildId } = await params;
  const data = await getGuildArtifactsData(guildId);

  if (!data) return { title: "Artifacts" };

  return {
    title: `${data.guild.name} — Artifacts`,
    description: `Manage and craft guild artifacts for ${data.guild.name}`,
  };
}

export default async function ArtifactsPage({ params }: Props) {
  const { guildId } = await params;
  const data = await getGuildArtifactsData(guildId);

  if (!data) notFound();

  const craftedArtifacts = data.artifacts.filter((a) => a.level > 0);
  const uncraftedArtifacts = data.artifacts.filter((a) => a.level === 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/guilds/${guildId}`}>
              <button className="rounded p-2 hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Guild Artifacts
              </h1>
              <p className="text-sm text-muted-foreground">{data.guild.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-6">
          <ArtifactsStats
            slots={data.slots}
            totalArtifacts={data.artifacts.length}
            craftedCount={craftedArtifacts.length}
            vaultBalance={data.guild.vaultBalance}
          />
        </div>

        {/* Info Alert */}
        <Alert className="mb-6">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>About Guild Artifacts</AlertTitle>
          <AlertDescription>
            Guild artifacts provide powerful buffs to all members. Resonate Echo
            Shards (earned from mining/tuning/drifts) to craft new artifacts,
            then upgrade them to Level 10. Only LEADER/OFFICER can finalize
            crafting, upgrades, and equip artifacts. Available slots increase
            with vault level.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Artifacts Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipped Artifacts */}
            {craftedArtifacts.filter((a) => a.isEquipped).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Equipped Artifacts (
                  {craftedArtifacts.filter((a) => a.isEquipped).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {craftedArtifacts
                    .filter((a) => a.isEquipped)
                    .map((artifact) => (
                      <ArtifactCard
                        key={artifact.id}
                        artifact={artifact}
                        guildId={guildId}
                        vaultBalance={data.guild.vaultBalance}
                        vaultLevel={data.guild.vaultLevel}
                        equippedCount={data.slots.used}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Crafted but Not Equipped */}
            {craftedArtifacts.filter((a) => !a.isEquipped).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Crafted Artifacts (
                  {craftedArtifacts.filter((a) => !a.isEquipped).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {craftedArtifacts
                    .filter((a) => !a.isEquipped)
                    .map((artifact) => (
                      <ArtifactCard
                        key={artifact.id}
                        artifact={artifact}
                        guildId={guildId}
                        vaultBalance={data.guild.vaultBalance}
                        vaultLevel={data.guild.vaultLevel}
                        equippedCount={data.slots.used}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Uncrafted Artifacts (In Progress) */}
            {uncraftedArtifacts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  In Progress ({uncraftedArtifacts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uncraftedArtifacts.map((artifact) => (
                    <ArtifactCard
                      key={artifact.id}
                      artifact={artifact}
                      guildId={guildId}
                      vaultBalance={data.guild.vaultBalance}
                      vaultLevel={data.guild.vaultLevel}
                      equippedCount={data.slots.used}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {data.artifacts.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Artifacts Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Start crafting your first artifact by resonating Echo Shards
                  from the available templates below. Artifacts provide powerful
                  buffs to all guild members!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Available Templates */}
          <aside>
            <AvailableTemplates
              templates={data.availableTemplates}
              currentVaultLevel={data.guild.vaultLevel}
              guildId={guildId}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
