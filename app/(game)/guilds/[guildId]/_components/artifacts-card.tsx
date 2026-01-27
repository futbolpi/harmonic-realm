import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getArtifactCardData } from "../artifacts/services";

type ArtifactsCardProps = {
  guildId: string;
};

export default async function ArtifactsCard({ guildId }: ArtifactsCardProps) {
  const data = await getArtifactCardData(guildId);

  const slotPercentage = (data.equipped / data.maxSlots) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Guild Artifacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.total === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              No artifacts crafted yet. Start resonating Echo Shards to unlock
              powerful guild-wide buffs!
            </p>
            <Button asChild variant="outline">
              <Link href={`/guilds/${guildId}/artifacts`}>View Artifacts</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground mb-1">Equipped</p>
                <p className="text-2xl font-bold">
                  {data.equipped}
                  <span className="text-sm text-muted-foreground">
                    /{data.maxSlots}
                  </span>
                </p>
                <Progress value={slotPercentage} className="h-1 mt-2" />
              </div>

              <div className="p-3 rounded-lg border bg-card">
                <p className="text-xs text-muted-foreground mb-1">Crafted</p>
                <p className="text-2xl font-bold">{data.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total artifacts
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {data.maxSlots - data.equipped} slot
                {data.maxSlots - data.equipped !== 1 ? "s" : ""} available
              </p>
              <Link
                href={`/guilds/${guildId}/artifacts`}
                className="text-sm text-primary hover:underline"
              >
                Manage →
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
