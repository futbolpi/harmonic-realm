import { Zap, ArrowRight, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { differenceInHours } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SurgeWidgetProps {
  activeCount: number;
  stabilizedToday: number;
  expiresAt: Date | null;
  topRank: number | null;
}

export function SurgeWidget({
  activeCount,
  stabilizedToday,
  expiresAt,
  topRank,
}: SurgeWidgetProps) {
  const hoursLeft = expiresAt
    ? Math.max(0, differenceInHours(expiresAt, new Date()))
    : 0;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <CardTitle>Resonance Surge</CardTitle>
          </div>
          {hoursLeft > 0 && (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-500"
            >
              <Clock className="h-3 w-3 mr-1" />
              {hoursLeft}h left
            </Badge>
          )}
        </div>
        <CardDescription>
          Daily high-yield nodes in active zones
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* FOMO Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <p className="text-2xl font-bold text-amber-500">{activeCount}</p>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Claimed</p>
            </div>
            <p className="text-2xl font-bold text-green-500">
              {stabilizedToday}
            </p>
          </div>
        </div>

        {/* FOMO Message */}
        {activeCount > 0 && hoursLeft > 0 && hoursLeft <= 6 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm font-medium text-amber-500">
              ⚡ Hurry! {activeCount} nodes expire in {hoursLeft}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mine now to claim permanent ownership
            </p>
          </div>
        )}

        {topRank && (
          <div className="text-xs text-center text-muted-foreground">
            Your nearest node:{" "}
            <span className="font-semibold">Rank #{topRank}</span>
          </div>
        )}

        <Link href="/resonance-surge">
          <Button className="w-full" variant="default">
            View Heatmap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
