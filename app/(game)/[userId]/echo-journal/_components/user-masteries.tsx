import { prisma } from "@/lib/prisma";
import { getAllUserMasteriesInfo } from "@/lib/utils/mastery";
import { MasterySummary } from "./mastery-summary";
import { MasteryCard } from "./mastery-card";
import { EmptyMasteryState } from "./empty-mastery-state";

interface UserMasteriesProps {
  userId: string;
}

export async function UserMasteries({ userId }: UserMasteriesProps) {
  const masteriesData = await getAllUserMasteriesInfo(userId, prisma);

  if (masteriesData.masteries.length === 0) {
    return <EmptyMasteryState />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-700">
      {/* Harmonic Resonance Summary */}
      <MasterySummary summary={masteriesData.summary} />

      {/* Individual Mastery Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {masteriesData.masteries.map((masteryInfo, index) => (
          <MasteryCard
            key={masteryInfo.mastery.id}
            masteryInfo={masteryInfo}
            animationDelay={index * 100}
          />
        ))}
      </div>
    </div>
  );
}
