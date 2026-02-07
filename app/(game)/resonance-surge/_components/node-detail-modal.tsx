"use client";

import { MapPin, Zap, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
} from "@/components/credenza";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SurgeNode } from "../services";

interface NodeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surge: SurgeNode | null;
}

export function NodeDetailModal({
  open,
  onOpenChange,
  surge,
}: NodeDetailModalProps) {
  if (!surge) return null;

  const timeLeft = formatDistanceToNow(surge.expiresAt, { addSuffix: true });

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Zap
              className={`h-5 w-5 ${surge.isStabilized ? "text-green-500" : "text-amber-500"}`}
            />
            {surge.node.name}
          </CredenzaTitle>
          <CredenzaDescription>
            Rank #{surge.hexRank} in today&apos;s surge
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-4 p-4">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{surge.node.type.name}</Badge>
            <Badge variant="secondary">{surge.node.type.rarity}</Badge>
            {surge.isStabilized ? (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Stabilized
              </Badge>
            ) : (
              <Badge className="bg-amber-500">
                <Clock className="h-3 w-3 mr-1" />
                Expires {timeLeft}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Activity Score"
              value={surge.activityScore.toLocaleString()}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricCard
              label="Yield Multiplier"
              value={`${surge.baseMultiplier}×`}
              icon={<Zap className="h-4 w-4 text-amber-500" />}
              highlight
            />
            <MetricCard
              label="Base Yield"
              value={`${surge.node.type.baseYieldPerMinute.toFixed(1)}/min`}
              icon={<Zap className="h-4 w-4" />}
            />
            <MetricCard
              label="Hex Rank"
              value={`#${surge.hexRank}`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          {surge.isStabilized && surge.stabilizedBy && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Stabilized By
              </p>
              <p className="font-semibold text-green-500">
                @{surge.stabilizedBy}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(surge.stabilizedAt!, { addSuffix: true })}
              </p>
            </div>
          )}

          {!surge.isStabilized && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm font-medium text-amber-500 mb-1">
                ⚡ Mine to Anchor Permanently
              </p>
              <p className="text-xs text-muted-foreground">
                Be the first to mine this node and it becomes permanent content
                in the Lattice!
              </p>
            </div>
          )}

          <Link href={`/nodes/${surge.node.id}`} className="block">
            <Button className="w-full" variant="default">
              <MapPin className="h-4 w-4 mr-2" />
              View on Map
            </Button>
          </Link>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}

function MetricCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${highlight ? "bg-amber-500/10 border-amber-500/20" : "bg-muted/50"}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-amber-500" : ""}`}>
        {value}
      </p>
    </div>
  );
}
