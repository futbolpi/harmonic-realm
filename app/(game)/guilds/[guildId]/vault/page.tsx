import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

import VaultClient from "./_components/vault-client";
import TopContributors from "./_components/top-contributors";
import VaultStats from "./_components/vault-stats";
import VaultFallback from "./_components/vault-loading";
import { getVaultPageData } from "./services";

type Props = { params: Promise<{ guildId: string }> };

export default async function VaultPage({ params }: Props) {
  const { guildId } = await params;

  const [weekDeposit, guild] = await getVaultPageData(guildId);

  if (!guild) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/guilds/${guildId}`}>
              <button className="rounded p-2 hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold">💎 Vault</h1>
          </div>
          <div className="text-sm text-muted-foreground">{guild.name}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<VaultFallback />}>
              <VaultClient
                guild={guild}
                weekDeposit={weekDeposit._sum.amount}
              />
            </Suspense>
          </div>

          <aside className="space-y-6">
            <VaultStats
              totalContributed={guild.totalContributed}
              weekDeposit={weekDeposit._sum.amount}
            />

            <TopContributors
              topContributors={guild.members}
              totalContributed={guild.totalContributed}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
