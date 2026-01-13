import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TerritoriesOverview from "./overview-stats";
import TerritoriesMapView from "./map-view";
import ActiveWarsSection from "./active-wars-section";
import ControlledTerritoriesSection from "./controlled-territories-section";
import AllTerritoriesModal from "./all-territories-modal";
import AllWarsModal from "./all-wars-modal";
import type { InitialChallenges, InitialTerritories } from "../services";

type Stats = {
  controlledTerritories: number;
  territoriesUnderChallenge: number;
  expiringTerritories: number;
  totalStaked: number;
};

interface GuildTerritoriesClientProps {
  guildId: string;
  initialTerritories: InitialTerritories;
  initialStats: Stats;
  initialChallenges: InitialChallenges;
}

export default function GuildTerritoriesClient({
  guildId,
  initialTerritories,
  initialStats,
  initialChallenges,
}: GuildTerritoriesClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Territory Control
              </h1>
              <p className="text-base text-muted-foreground">
                Manage your guild&apos;s hexagonal territories and monitor
                ongoing harmonic battles across the Lattice
              </p>
            </div>

            {/* Back to Guild */}
            <div>
              <Button variant="ghost" asChild>
                <Link href={`/guilds/${guildId}`}>Back to Guild</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* Overview Stats */}
        <TerritoriesOverview stats={initialStats} />

        {/* Map and Wars Tabs */}
        <Tabs defaultValue="map" className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <TabsList className="flex gap-1 overflow-x-auto w-full sm:w-auto">
                <TabsTrigger
                  value="map"
                  className="whitespace-nowrap px-3 py-2 text-sm"
                >
                  Territory Map
                </TabsTrigger>
                <TabsTrigger
                  value="wars"
                  className="whitespace-nowrap px-3 py-2 text-sm"
                >
                  Active Wars
                </TabsTrigger>
                <TabsTrigger
                  value="territories"
                  className="whitespace-nowrap px-3 py-2 text-sm"
                >
                  All Territories
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex gap-2 flex-wrap items-center mt-2 sm:mt-0">
              {initialChallenges.length > 0 && (
                <AllWarsModal challenges={initialChallenges} />
              )}
              {initialTerritories.length > 0 && (
                <AllTerritoriesModal territories={initialTerritories} />
              )}
            </div>
          </div>

          <TabsContent value="map" className="space-y-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Hex Grid Territory Map</CardTitle>
                <CardDescription>
                  Interactive visualization of your guild&apos;s territorial
                  control. Green hexes are secured, red hexes are under
                  challenge.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {initialTerritories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <div className="text-center max-w-lg">
                      <h3 className="text-lg font-semibold">
                        No Territories Secured
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your guild has not yet staked any zones on the Lattice.
                        Claiming hexes expands your influence and earns rewards
                        — lead your guild into the Lattice.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href="/territories">Stake New Territory</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/guilds/${guildId}`}>Guild Hub</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <TerritoriesMapView
                    territories={initialTerritories.map((t) => ({
                      activeChallenge: !!t.activeChallengeId,
                      hexId: t.hexId,
                    }))}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wars" className="space-y-4">
            <ActiveWarsSection challenges={initialChallenges} />
          </TabsContent>

          <TabsContent value="territories" className="space-y-4">
            <ControlledTerritoriesSection territories={initialTerritories} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
