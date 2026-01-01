import { Suspense } from "react";

import RecentTransactions from "./recent-transactions";
import UpgradeCard from "./upgrade-card";
import ContributionCard from "./contribution-card";
import DetailCard from "./detail-card";
import RecentTransactionsFallback from "./recent-transactions-loading";
import { getVaultClientData } from "../services";

type Guild = {
  id: string;
  piTransactionId: string | null;
  vaultBalance: number;
  vaultLevel: number;
  totalContributed: number;
};

type VaultClientProps = {
  guild: Guild;
  weekDeposit: number | null;
};

export default async function VaultClient({
  guild,
  weekDeposit,
}: VaultClientProps) {
  const [nextLevel, currentLevel] = await getVaultClientData(guild.vaultLevel);

  return (
    <div className="space-y-6">
      <DetailCard
        guild={{
          vaultBalance: guild.vaultBalance,
          vaultLevel: guild.vaultLevel,
        }}
        nextLevel={nextLevel}
        currentLevel={currentLevel}
      />

      <ContributionCard
        guild={{
          id: guild.id,
          totalContributed: guild.totalContributed,
          piTransactionId: guild.piTransactionId,
        }}
        projectedDistribution={weekDeposit ? weekDeposit * 0.2 : 0}
      />

      {nextLevel && (
        <UpgradeCard
          guild={{
            id: guild.id,
            vaultBalance: guild.vaultBalance,
            vaultLevel: guild.vaultLevel,
          }}
          vaultUpgrade={{
            resonanceCost: nextLevel.resonanceCost,
            description: nextLevel.description,
            name: nextLevel.name,
          }}
        />
      )}

      <Suspense fallback={<RecentTransactionsFallback />}>
        <RecentTransactions guildId={guild.id} />
      </Suspense>
    </div>
  );
}
