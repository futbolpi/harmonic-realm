"use client";

import { useState } from "react";
import { Zap, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { differenceInHours } from "date-fns";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SurgeMapModalProps {
  activeCount: number;
  stabilizedToday: number;
  expiresAt: Date | null;
}

export function SurgeMapModal({
  activeCount,
  stabilizedToday,
  expiresAt,
}: SurgeMapModalProps) {
  const [open, setOpen] = useState(false);
  const hoursLeft = expiresAt
    ? Math.max(0, differenceInHours(expiresAt, new Date()))
    : 0;

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Surge ({activeCount})
        </Button>
      </CredenzaTrigger>

      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Resonance Surge Active
          </CredenzaTitle>
          <CredenzaDescription>
            {activeCount} high-yield nodes available now
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <p className="text-sm text-muted-foreground">Active Nodes</p>
              </div>
              <p className="text-3xl font-bold text-amber-500">{activeCount}</p>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Stabilized</p>
              </div>
              <p className="text-3xl font-bold text-green-500">
                {stabilizedToday}
              </p>
            </div>
          </div>

          {hoursLeft > 0 && (
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <Badge variant="outline" className="border-amber-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {hoursLeft}h
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Mine any Surge node to make it permanent. Unclaimed nodes expire
                at midnight UTC.
              </p>
            </div>
          )}

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium mb-2">⚡ 2.0× Yield Multiplier</p>
            <p className="text-xs text-muted-foreground">
              Surge nodes offer double the standard mining yield. Be the first
              to mine one and it becomes yours forever!
            </p>
          </div>

          <Link href="/resonance-surge" onClick={() => setOpen(false)}>
            <Button className="w-full" size="lg">
              View Surge Heatmap
            </Button>
          </Link>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
