import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

interface TerritoryStatus {
  id: string;
  hexId: string;
  activeChallengeId: string | null;
  controlEndsAt: Date | null;
  isUnderAttack: boolean;
  defendTimeRemaining?: string;
}

interface AttackingTerritory {
  id: string;
  hexId: string;
  targetHexId: string;
  defendingGuildId: string;
  attackEndsAt: Date;
  status: "attacking" | "defending";
}

const TerritoriesCard = async ({ guildId }: { guildId: string }) => {
  // Query 1: Territories owned by the guild (controlled + under attack)
  const ownedTerritories = await prisma.territory.findMany({
    where: { guildId },
    select: {
      id: true,
      hexId: true,
      activeChallengeId: true,
      controlEndsAt: true,
    },
  });

  // Query 2: Territories the guild is attacking
  const attackingChallenges = await prisma.territoryChallenge.findMany({
    where: {
      attackerId: guildId,
      resolved: false,
    },
    select: {
      id: true,
      territoryId: true,
      territory: {
        select: {
          hexId: true,
        },
      },
      endsAt: true,
    },
  });

  // Enrich owned territories with status
  const enrichedOwned: TerritoryStatus[] = ownedTerritories.map((t) => ({
    ...t,
    isUnderAttack: !!t.activeChallengeId,
    defendTimeRemaining: t.controlEndsAt
      ? formatDistanceToNow(t.controlEndsAt, { addSuffix: true })
      : undefined,
  }));

  // Transform attacking challenges
  const attacking: AttackingTerritory[] = attackingChallenges.map((ac) => ({
    id: ac.id,
    hexId: ac.territory.hexId,
    targetHexId: ac.territory.hexId,
    defendingGuildId: ac.id,
    attackEndsAt: ac.endsAt,
    status: "attacking",
  }));

  const underAttack = enrichedOwned.filter((t) => t.isUnderAttack);
  const stable = enrichedOwned.filter((t) => !t.isUnderAttack);
  const totalTerritories = enrichedOwned.length + attacking.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Territories</span>
          <Badge variant="secondary" className="ml-2">
            {totalTerritories}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stable Territories Section */}
        {stable.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              ✓ Controlled ({stable.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stable.slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  href={`/territories/${t.hexId}`}
                  prefetch={false}
                  className="group block p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:shadow-md transition-all duration-200"
                >
                  <p className="font-semibold text-sm text-emerald-900 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    Zone {t.hexId.substring(5)}..
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-200 mt-2">
                    {t.defendTimeRemaining}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Under Attack Section - HIGH PRIORITY */}
        {underAttack.length > 0 && (
          <div className="p-3 rounded-lg border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/30">
            <p className="text-xs font-semibold text-red-700 dark:text-red-200 uppercase mb-3 flex items-center">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
              Under Attack ({underAttack.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {underAttack.map((t) => (
                <Link
                  key={t.id}
                  href={`/territories/${t.hexId}`}
                  prefetch={false}
                  className="group block p-3 rounded-lg border border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/50 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-200 dark:hover:bg-red-800 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200"
                >
                  <p className="font-semibold text-sm text-red-900 dark:text-red-100 group-hover:text-red-700 dark:group-hover:text-red-200 transition-colors">
                    Zone {t.hexId.substring(5)}..
                  </p>
                  <Badge variant="destructive" className="mt-2 text-xs">
                    ⚔️ DEFEND NOW
                  </Badge>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-2 font-medium">
                    {t.defendTimeRemaining}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Attacking Territories Section */}
        {attacking.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              ⚔️ Attacking ({attacking.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {attacking.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  href={`/territories/${a.hexId}`}
                  prefetch={false}
                  className="group block p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 hover:border-amber-400 dark:hover:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:shadow-md transition-all duration-200"
                >
                  <p className="font-semibold text-sm text-amber-900 dark:text-amber-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                    Zone {a.hexId.substring(5)}..
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Attacking
                  </Badge>
                  <p className="text-xs text-amber-700 dark:text-amber-200 mt-2">
                    {formatDistanceToNow(a.attackEndsAt, { addSuffix: true })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalTerritories === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              No territories yet. Start claiming the map!
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href={`/guilds/${guildId}/territories`}
            className="text-sm text-primary hover:underline font-medium"
          >
            [View all →]
          </Link>

          <Button size="sm" variant="outline" asChild>
            <Link href="/territories">Stake Territory</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TerritoriesCard;
