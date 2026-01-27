import { Sparkles, Zap, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ArtifactsStatsProps = {
  slots: {
    used: number;
    total: number;
    available: number;
  };
  totalArtifacts: number;
  craftedCount: number;
  vaultBalance: number;
};

export default function ArtifactsStats({
  slots,
  totalArtifacts,
  craftedCount,
  vaultBalance,
}: ArtifactsStatsProps) {
  const slotPercentage = (slots.used / slots.total) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Active Slots</p>
              <p className="text-2xl font-bold">
                {slots.used}/{slots.total}
              </p>
              <Progress value={slotPercentage} className="h-1 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Trophy className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Crafted Artifacts</p>
              <p className="text-2xl font-bold">
                {craftedCount}/{totalArtifacts}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalArtifacts - craftedCount} in progress
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Zap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Vault Balance</p>
              <p className="text-2xl font-bold">
                {vaultBalance.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">RESONANCE</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
