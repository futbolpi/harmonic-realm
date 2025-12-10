"use client";

import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/queries/use-profile";
import { DashboardSkeleton } from "./dashboard-skeleton";
import DashboardError from "./dashboard-error";
import LevelProgress from "./level-progress";
import QuickStats from "./quick-stats";
import { QuickActions } from "./quick-actions";
import GlobalPhaseCard from "./global-phase-card";
import GenesisPhaseCard from "./genesis-phase-card";
import StartTutorialModal from "../../_components/start-tutorial-modal";

type DashboardClientPageProps = {
  currentPhase?: number;
  sessionsCompleted: number;
  nextPhaseThreshold: number;
  harmonizerCount: number;
};

export default function DashboardClientPage({
  currentPhase,
  sessionsCompleted,
  nextPhaseThreshold,
  harmonizerCount,
}: DashboardClientPageProps) {
  const { data: userProfile, isLoading, isError } = useProfile();

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (isError) {
    return <DashboardError />;
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2" id="dashboard">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-neon-purple bg-clip-text text-transparent">
              Resonance Hub
            </h1>
            <p className="text-muted-foreground">
              Your harmony with the cosmic Lattice, Pioneer{" "}
              {userProfile.username}
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-primary border-primary/50 bg-primary/10"
          >
            Level {userProfile.level}
          </Badge>
        </div>

        {/* Level Progress */}
        <LevelProgress
          currentLevel={userProfile.level}
          currentXP={userProfile.xp}
        />
      </div>

      <QuickStats
        level={userProfile.level}
        minerShares={userProfile.sharePoints}
        nodesMined={userProfile.sessions.length}
        xp={userProfile.xp}
      />

      {currentPhase ? (
        <GlobalPhaseCard
          currentPhase={currentPhase}
          sessionsCompleted={sessionsCompleted}
          nextPhaseThreshold={nextPhaseThreshold}
        />
      ) : (
        <GenesisPhaseCard harmonizerCount={harmonizerCount} />
      )}

      <QuickActions userId={userProfile.id} />
      {/* Global Credenza modal prompting users to complete Ephemeral Spark tutorial */}
      <StartTutorialModal />
    </div>
  );
}
