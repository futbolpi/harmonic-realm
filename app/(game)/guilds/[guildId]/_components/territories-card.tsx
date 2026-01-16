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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {territories.slice(0, 3).map((t) => (
            <Link
              key={t.id}
              href={`/territories/${t.hexId}`}
              prefetch={false}
              className="group p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary transition-colors"
            >
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                Zone {t.hexId.substring(5)}..
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.activeChallengeId ? "⚔️ WAR" : "✓ Stable"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(t.controlEndsAt || new Date(), {
                  addSuffix: true,
                })}
              </p>
            </Link>
          ))}
        </div>
        <div className="flex items-center">
          <Link
            href={`/guilds/${guildId}/territories`}
            className="text-sm text-primary hover:underline"
          >
            [View all →]
          </Link>
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
