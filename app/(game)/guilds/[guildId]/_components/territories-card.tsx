import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

const TerritoriesCard = async ({ guildId }: { guildId: string }) => {
  const territories = await prisma.territory.findMany({
    where: { guildId },
    select: {
      id: true,
      hexId: true,
      activeChallengeId: true,
      controlEndsAt: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Territories ({territories.length} Controlled)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 flex-wrap">
          {territories.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="p-3 w-44 rounded-lg border border-border bg-card"
            >
              <p className="font-semibold">Zone {t.hexId}</p>
              <p className="text-xs text-muted-foreground">
                {t.activeChallengeId ? "⚔️ WAR" : "✓"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(t.controlEndsAt || new Date(), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ))}

          <div className="flex items-center">
            <Link
              href={`/guilds/${guildId}/territories`}
              className="text-sm text-primary"
            >
              [More →]
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/territories">Stake New Territory</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TerritoriesCard;
