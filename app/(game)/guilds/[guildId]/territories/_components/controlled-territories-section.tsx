"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InitialTerritories } from "../services";

interface ControlledTerritoriesSectionProps {
  territories: InitialTerritories;
}

export default function ControlledTerritoriesSection({
  territories,
}: ControlledTerritoriesSectionProps) {
  const grouped = useMemo(() => {
    const now = new Date();
    const active = territories.filter(
      (t) =>
        t.controlEndsAt && new Date(t.controlEndsAt) > now && !t.activeChallenge
    );
    const expiring = territories.filter(
      (t) =>
        t.controlEndsAt &&
        new Date(t.controlEndsAt) > now &&
        new Date(t.controlEndsAt).getTime() - now.getTime() <
          24 * 60 * 60 * 1000 &&
        !t.activeChallenge
    );
    const challenged = territories.filter((t) => t.activeChallenge);

    return { active, expiring, challenged };
  }, [territories]);

  if (territories.length === 0) {
    return (
      <Card className="border-dashed border-border/50">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">No Territories Claimed</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your guild hasn&apos;t staked any territories yet. Begin your
              harmonic conquest by exploring the territories map and claiming
              your first zone.
            </p>
            <Button asChild className="mt-4">
              <Link href="/territories">Explore Territories Map</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Secured Territories */}
      {grouped.active.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              Secured Territories
            </h3>
            <p className="text-sm text-muted-foreground">
              {grouped.active.length} zones under stable control
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {grouped.active.map((territory) => (
              <Card
                key={territory.hexId}
                className="bg-gradient-to-br from-green-500/5 to-green-500/2 border-green-500/10"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="font-mono text-xs text-muted-foreground">
                        {territory.hexId}
                      </div>
                      <div className="font-semibold">
                        {territory.nodeCount} Nodes
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {territory.category} Traffic
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {territory.currentStake} RES
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="default" className="block bg-green-600">
                        Secured
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          territory?.controlEndsAt || new Date(),
                          { addSuffix: true }
                        )}
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="w-full"
                      >
                        <Link href={`/territories/${territory.hexId}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Territories */}
      {grouped.expiring.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Expiring Soon</h3>
            <p className="text-sm text-muted-foreground">
              Renew these territories to maintain control
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {grouped.expiring.map((territory) => (
              <Card
                key={territory.hexId}
                className="bg-gradient-to-br from-amber-500/5 to-amber-500/2 border-amber-500/20"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="font-mono text-xs text-muted-foreground">
                        {territory.hexId}
                      </div>
                      <div className="font-semibold">
                        {territory.nodeCount} Nodes
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {territory.category} Traffic
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {territory.currentStake} RES
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className="block bg-amber-600">
                        Expiring{" "}
                        {formatDistanceToNow(
                          territory?.controlEndsAt || new Date()
                        )}
                      </Badge>
                      <Button asChild size="sm" variant="default">
                        <Link href={`/territories/${territory.hexId}`}>
                          Renew
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Challenged Territories */}
      {grouped.challenged.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              Under Challenge
            </h3>
            <p className="text-sm text-muted-foreground">
              {grouped.challenged.length} territory being contested
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {grouped.challenged.map((territory) => (
              <Card
                key={territory.hexId}
                className="bg-gradient-to-br from-red-500/5 to-red-500/2 border-red-500/20"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="font-mono text-xs text-muted-foreground">
                        {territory.hexId}
                      </div>
                      <div className="font-semibold">Under Attack</div>
                      <div className="text-sm text-muted-foreground">
                        Challenged by{" "}
                        <span className="font-semibold">
                          {territory.activeChallenge?.attacker.name}
                        </span>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="default"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Link href={`/territories/${territory.hexId}`}>
                        Defend
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
