"use client";

import { Crown, Lock, MapPin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Territory = {
  centerLat: number;
  centerLon: number;
  hexId: string;
  guild: {
    name: string;
  } | null;
};

interface Props {
  territory: Territory;
}

export default function TerritoryHeader({ territory }: Props) {
  const getStatusIcon = () => {
    if (!territory.guild) return <Lock className="w-5 h-5 text-slate-500" />;
    return <Crown className="w-5 h-5 text-emerald-600" />;
  };

  const getStatusBadge = () => {
    if (!territory.guild)
      return { label: "Unclaimed", variant: "outline" as const };
    return { label: "Controlled", variant: "default" as const };
  };

  const status = getStatusBadge();

  return (
    <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {territory.guild
                ? `${territory.guild.name}'s Territory`
                : "Unclaimed Territory"}
            </h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <code className="bg-muted/50 px-2 py-1 rounded font-mono text-xs">
                {territory.hexId}
              </code>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link
              href={`/map?lat=${territory.centerLat}&lng=${territory.centerLon}`}
            >
              <Button variant="outline" size="sm" className="bg-transparent">
                View on Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
