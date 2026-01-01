"use client";

import { type SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Guild } from "../services";

type RecommendedProps = {
  recommended: Guild[];
  openDetails: (g: Guild) => void;
  setShowRequestModal: (value: SetStateAction<boolean>) => void;
  setSelected: (value: SetStateAction<Guild | null>) => void;
};

const Recommended = ({
  recommended,
  openDetails,
  setShowRequestModal,
  setSelected,
}: RecommendedProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🌟 Recommended for You</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommended.map((g) => (
          <Card key={g.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{g.emblem}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{g.name}</h4>
                    <div className="text-xs text-muted-foreground">
                      {g.requireApproval ? "Request" : "Open"} •{" "}
                      {g._count.members}/{g.maxMembers} Members
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {/* 📍 {g.distanceKm.toFixed(1)} km */}
                    📍 N/A km
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Prestige: Lv {g.vaultLevel} • Vault: Lv {g.vaultLevel}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button onClick={() => openDetails(g)}>View Details</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelected(g);
                      setShowRequestModal(true);
                    }}
                  >
                    {g.requireApproval ? "Request Join" : "Join Instantly"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recommended;
