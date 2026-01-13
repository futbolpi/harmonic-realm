"use client";

import { X, Crown, AlertCircle, Lock, Zap, Users } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import type { TerritoryForMap } from "@/lib/api-helpers/server/guilds/territories-map";
import { useProfile } from "@/hooks/queries/use-profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TerritoryButton from "./territory-button";

type TerritoryModalProps = {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  currentHex: string | null;
  handleClearSelection: () => void;
  selectedTerritoryData: TerritoryForMap | null;
};

const TerritoryModal = ({
  showModal,
  setShowModal,
  currentHex,
  handleClearSelection,
  selectedTerritoryData,
}: TerritoryModalProps) => {
  const { data } = useProfile();
  const userGuildId = data?.guildMembership?.guildId;

  const getStatusBadge = () => {
    if (!selectedTerritoryData?.guild) {
      return {
        label: "Unclaimed",
        variant: "outline" as const,
        icon: Lock,
      };
    }
    if (selectedTerritoryData.guild.id === userGuildId) {
      return {
        label: "Your Territory",
        variant: "default" as const,
        icon: Crown,
      };
    }
    return {
      label: "Enemy Territory",
      variant: "secondary" as const,
      icon: AlertCircle,
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const getTrafficCategory = (score: number) => {
    if (score > 200) return { label: "High-Value", value: "★★★" };
    if (score > 100) return { label: "Medium-Value", value: "★★" };
    return { label: "Low-Value", value: "★" };
  };

  const trafficCategory = getTrafficCategory(
    selectedTerritoryData?.trafficScore || 0
  );

  const isUnclaimed = !selectedTerritoryData?.guild;

  return (
    <Credenza open={showModal} onOpenChange={setShowModal}>
      <CredenzaTrigger asChild>
        <Button className="rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
          <span>View Territory</span>
          {currentHex && (
            <span className="text-xs opacity-75 font-mono">
              ({currentHex.slice(0, 6)}...)
            </span>
          )}
        </Button>
      </CredenzaTrigger>

      <CredenzaContent className="max-w-md md:max-h-96 md:overflow-y-auto">
        <CredenzaHeader className="pb-3">
          <div className="flex items-start justify-between w-full gap-2">
            <div className="flex-1">
              <CredenzaTitle className="text-xl mb-2">
                {isUnclaimed ? "Unclaimed Territory" : "Territory Information"}
              </CredenzaTitle>
              {currentHex && (
                <p className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded w-fit">
                  {currentHex}
                </p>
              )}
            </div>
            {currentHex && (
              <button
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CredenzaHeader>

        <CredenzaBody className="space-y-5 max-h-96 overflow-y-auto">
          {selectedTerritoryData || currentHex ? (
            <>
              {/* Status Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" />
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Territory Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Nodes */}
                <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">
                      NODES
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {selectedTerritoryData?.nodeCount || 0}
                  </p>
                </div>

                {/* Traffic Score */}
                <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">
                      TRAFFIC
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {Math.round(selectedTerritoryData?.trafficScore || 0)}
                  </p>
                </div>
              </div>

              {/* Traffic Category */}
              <div className="bg-accent/10 rounded-lg p-3 border border-accent/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Territory Value</span>
                  <div className="text-right">
                    <p className="text-sm font-bold">{trafficCategory.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {trafficCategory.value}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guild Info if Controlled */}
              {selectedTerritoryData?.guild && (
                <>
                  <Separator />
                  <div className="bg-card rounded-lg p-3 border border-border/30 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      CONTROLLING GUILD
                    </p>
                    <p className="text-lg font-bold">
                      {selectedTerritoryData.guild.name}
                    </p>
                    {selectedTerritoryData.guild.tag && (
                      <p className="text-xs text-muted-foreground font-mono">
                        [{selectedTerritoryData.guild.tag}]
                      </p>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Info Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {isUnclaimed
                    ? "This territory awaits a guild's resonant claim. Stake RESONANCE to establish control and unlock territorial bonuses for your members."
                    : "This territory is under guild control. View details to track challenges, contributors, and territorial benefits."}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">
                Select a territory to view detailed information
              </p>
            </div>
          )}
        </CredenzaBody>

        {(selectedTerritoryData || currentHex) && (
          <div className="px-6 pb-6 space-y-2 border-t pt-4">
            <TerritoryButton
              selectedTerritoryData={selectedTerritoryData}
              currentHex={currentHex}
              setShowModal={setShowModal}
            />
            <CredenzaClose asChild>
              <Button variant="outline" className="w-full bg-transparent">
                Close
              </Button>
            </CredenzaClose>
          </div>
        )}
      </CredenzaContent>
    </Credenza>
  );
};

export default TerritoryModal;
