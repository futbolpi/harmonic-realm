"use client";

import { List, Crown, AlertTriangle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  getDurabilityStatus,
  formatBoostPercentage,
} from "@/lib/utils/chambers";

interface Chamber {
  id: string;
  latitude: number;
  longitude: number;
  level: number;
  currentDurability: number;
  boost: number;
  createdAt: string;
  maintenanceDueAt: string;
}

interface ChambersListModalProps {
  chambers: Chamber[];
  selectedChamberId: string | null;
  onChamberSelect: (chamberId: string) => void;
}

export function ChambersListModal({
  chambers,
  selectedChamberId,
  onChamberSelect,
}: ChambersListModalProps) {
  if (chambers.length === 0) {
    return null;
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="secondary" className="flex-1 shadow-lg">
          <List className="mr-2 h-4 w-4" />
          Chambers ({chambers.length}/3)
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Your Echo Chambers
          </CredenzaTitle>
        </CredenzaHeader>

        <CredenzaBody className="space-y-3 max-h-96 overflow-y-auto py-4">
          {chambers.map((chamber, index) => {
            const durabilityStatus = getDurabilityStatus(
              chamber.currentDurability,
            );
            const isSelected = chamber.id === selectedChamberId;
            const needsMaintenance = chamber.currentDurability < 40;

            return (
              <button
                key={chamber.id}
                onClick={() => onChamberSelect(chamber.id)}
                className={cn(
                  "w-full p-4 rounded-lg border-2 transition-all duration-200",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card",
                )}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Chamber {index + 1}</span>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      Level {chamber.level}
                    </Badge>
                  </div>

                  {/* Durability Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Durability</span>
                      <span
                        className={cn("font-medium", durabilityStatus.color)}
                      >
                        {chamber.currentDurability.toFixed(1)}% •{" "}
                        {durabilityStatus.label}
                      </span>
                    </div>
                    <Progress
                      value={chamber.currentDurability}
                      className="h-2"
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Boost</div>
                      <div className="font-bold text-primary">
                        {formatBoostPercentage(chamber.level)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-medium">
                        {formatDistanceToNow(new Date(chamber.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Warning */}
                  {needsMaintenance && (
                    <div className="flex items-center gap-2 text-xs text-orange-500 bg-orange-500/10 p-2 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Maintenance recommended</span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {chamber.latitude.toFixed(4)},{" "}
                      {chamber.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
