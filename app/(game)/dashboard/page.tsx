import { getSiteStats } from "@/lib/api-helpers/server/site";
import DashboardClientPage from "./_components/dashboard-client-page";
import { SurgeWidget } from "./_components/surge-widget";
import { getSurgeData } from "./services";

export default async function DashboardPage() {
  const {
    latestPhase,
    sessionsCompleted,
    nextPhaseThreshold,
    pioneersAggregate,
  } = await getSiteStats();

  const { activeCount, oldestSurge, stabilizedCount } = await getSurgeData();

  return (
    <>
      <DashboardClientPage
        currentPhase={latestPhase?.phaseNumber}
        sessionsCompleted={sessionsCompleted}
        nextPhaseThreshold={nextPhaseThreshold}
        harmonizerCount={pioneersAggregate._count.id}
      />

      {/* Surge Widget */}
      {activeCount > 0 && (
        <div className="container mx-auto px-4">
          <SurgeWidget
            activeCount={activeCount}
            stabilizedToday={stabilizedCount}
            expiresAt={oldestSurge?.expiresAt || null}
            topRank={oldestSurge?.hexRank || null}
          />
        </div>
      )}
    </>
  );
}
