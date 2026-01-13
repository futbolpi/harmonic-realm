"use client";

import { Info, Zap, Users } from "lucide-react";

import type { TerritoryForMap } from "@/lib/api-helpers/server/guilds/territories-map";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type InfoModalProps = {
  territories: TerritoryForMap[];
  handleLocationSelect: (lat: number, lng: number) => void;
};

const InfoModal = ({ territories, handleLocationSelect }: InfoModalProps) => {
  const getTrafficLevel = (score: number) => {
    if (score > 200) return { label: "High", color: "bg-amber-500" };
    if (score > 100) return { label: "Medium", color: "bg-yellow-400" };
    return { label: "Low", color: "bg-slate-400" };
  };

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full shadow-lg bg-transparent"
        >
          <Info className="h-4 w-4" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle className="text-xl font-bold">
            Lattice Territory Watch
          </CredenzaTitle>
          <CredenzaDescription className="text-sm">
            Explore hexagonal zones and their resonant activity. Stake RESONANCE
            to claim unclaimed territories.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody className="overflow-y-auto max-h-96 space-y-2">
          {territories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No territories discovered yet.
            </div>
          ) : (
            territories.map((t) => {
              const trafficLevel = getTrafficLevel(t.trafficScore);
              return (
                <button
                  key={t.hexId}
                  onClick={() => handleLocationSelect(t.centerLat, t.centerLon)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/60 border border-border/30 hover:border-border transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold font-mono truncate">
                          {t.hexId.slice(0, 12)}...
                        </p>
                        <Badge
                          variant={t.guild ? "secondary" : "outline"}
                          className="text-xs whitespace-nowrap"
                        >
                          {t.guild ? "Controlled" : "Unclaimed"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{t.nodeCount} nodes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{Math.round(t.trafficScore)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${trafficLevel.color}`}
                        title={`${trafficLevel.label} Traffic`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {trafficLevel.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </CredenzaBody>
        <CredenzaFooter className="flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Tip:</strong> High-traffic zones near cities require larger
            stakes but offer greater control bonuses. Use the territory button
            to manage claims and initiate challenges.
          </p>
          <CredenzaClose asChild>
            <Button variant="outline" className="w-full bg-transparent">
              Close
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default InfoModal;
