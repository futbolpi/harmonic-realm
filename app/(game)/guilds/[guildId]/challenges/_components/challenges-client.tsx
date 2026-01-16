import type { GuildChallengesData } from "../services";
import ProgressOverview from "./progress-overview";
import ActiveChallengesSection from "./active-challenges-section";
import CompletedChallengesSection from "./completed-challenges-section";
import AvailableChallengesSection from "./available-challenges-section";
import ChallengeInfoCard from "./challenge-info-card";

interface ChallengesClientProps {
  data: GuildChallengesData;
  guildId: string;
}

export default function ChallengesClient({
  data,
  guildId,
}: ChallengesClientProps) {
  const activeCount = data.active.length ?? 0;
  const completedCount = data.completed.length ?? 0;
  const maxActive = 4;

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <ProgressOverview
        activeCount={activeCount}
        completedCount={completedCount}
        maxActive={maxActive}
        completed={data.completed}
      />

      {/* Active Challenges */}
      {activeCount > 0 ? (
        <ActiveChallengesSection challenges={data.active} guildId={guildId} />
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold">No active challenges</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Leaders can accept challenges from the available list below
          </p>
        </div>
      )}

      {/* Completed Challenges */}
      {completedCount > 0 && (
        <CompletedChallengesSection challenges={data.completed} />
      )}

      {/* Available Challenges */}
      <AvailableChallengesSection
        challenges={data.available}
        guildId={guildId}
        canAccept={activeCount < maxActive}
        guildMembers={data.guild._count.members}
        guildVaultLevel={data.guild.vaultLevel}
      />

      {/* Info Card */}
      <ChallengeInfoCard />
    </div>
  );
}
