import { Card } from "@/components/ui/card";

import type { ClientTerritoryDetail } from "../utils";
import TerritoryHeader from "./header";
import TerritoryMapView from "./map-view";
import DetailsCard from "./details-card";
import TerritoryControlSection from "./control-section";
import TerritoryChallengeSection from "./challenge-section";

interface Props {
  territory: ClientTerritoryDetail;
}

export default function TerritoryDetailClient({ territory }: Props) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <TerritoryHeader
        territory={{
          centerLat: territory.centerLat,
          centerLon: territory.centerLon,
          guild: territory.guild,
          hexId: territory.hexId,
        }}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <Card className="overflow-hidden">
              <TerritoryMapView
                territory={{
                  centerLat: territory.centerLat,
                  centerLon: territory.centerLon,
                  hexId: territory.hexId,
                  nodes: territory.nodes,
                }}
              />
            </Card>

            {/* Tabs for Details */}
            <DetailsCard territory={territory} />
          </div>

          {/* Right Column - Control & Challenge Info */}
          <div className="space-y-4">
            <TerritoryControlSection
              territory={{
                activeChallenge: !!territory.activeChallengeId,
                centerLat: territory.centerLat,
                centerLon: territory.centerLon,
                currentStake: territory.currentStake,
                daysRemaining: territory.controlStatus.daysRemaining || 0,
                guild: territory.guild,
                hexId: territory.hexId,
                trafficScore: territory.trafficScore,
              }}
            />
            {territory.activeChallenge && (
              <TerritoryChallengeSection
                challenge={territory.activeChallenge}
                territory={{
                  centerLat: territory.centerLat,
                  centerLon: territory.centerLon,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
