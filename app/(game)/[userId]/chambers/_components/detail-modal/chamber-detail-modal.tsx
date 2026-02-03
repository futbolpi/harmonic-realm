"use client";

import { Crown } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/queries/use-profile";
import StatsGridCard from "./stats-grid-card";
import DurabilityCard from "./durability-card";
import LocationCard from "./location-card";
import TimelineCard from "./timeline-card";
import InvestmentCard from "./investment-card";
import UpgradeSection from "./upgrade-section";
import MaintenanceSection from "./maintenance-section";
import DeactivationSection from "./deactivation-section";

interface ChamberDetailModalProps {
  chamber: {
    id: string;
    latitude: number;
    longitude: number;
    level: number;
    totalResonanceInvested: number;
    currentDurability: number;
    lastMaintenanceAt: string;
    maintenanceDueAt: string;
    boost: number;
    createdAt: string;
  };
  onClose: () => void;
  userId: string;
}

export function ChamberDetailModal({
  chamber,
  onClose,
  userId,
}: ChamberDetailModalProps) {
  const { data: userProfile } = useProfile();

  const userIsOwner = userId === userProfile?.id;

  return (
    <Credenza open={true} onOpenChange={(open) => !open && onClose()}>
      <CredenzaContent className="max-w-2xl">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Echo Resonance Chamber
          </CredenzaTitle>
          <CredenzaDescription>
            Level {chamber.level} Harmonic Sanctuary
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="manage" disabled={!userIsOwner}>
                Manage
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Stats Grid */}
              <StatsGridCard chamberLevel={chamber.level} />

              {/* Durability */}
              <DurabilityCard currentDurability={chamber.currentDurability} />

              {/* Location */}
              <LocationCard
                chamber={{
                  latitude: chamber.latitude,
                  longitude: chamber.longitude,
                }}
              />

              {/* Timeline */}
              <TimelineCard
                chamber={{
                  createdAt: chamber.createdAt,
                  lastMaintenanceAt: chamber.lastMaintenanceAt,
                  maintenanceDueAt: chamber.maintenanceDueAt,
                }}
              />

              {/* Investment */}
              <InvestmentCard
                totalResonanceInvested={chamber.totalResonanceInvested}
              />
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage" className="space-y-4 mt-4">
              {/* Upgrade Section */}
              <UpgradeSection
                chamber={{ id: chamber.id, level: chamber.level }}
                onClose={onClose}
                ownerId={userId}
              />

              {/* Maintenance Section */}
              <MaintenanceSection
                chamber={{
                  currentDurability: chamber.currentDurability,
                  id: chamber.id,
                  lastMaintenanceAt: chamber.lastMaintenanceAt,
                  level: chamber.level,
                }}
                onClose={onClose}
                ownerId={userId}
              />

              {/* Deactivation Section */}
              <DeactivationSection
                chamber={{
                  id: chamber.id,
                  totalResonanceInvested: chamber.totalResonanceInvested,
                }}
                onClose={onClose}
                ownerId={userId}
              />
            </TabsContent>
          </Tabs>
        </CredenzaBody>

        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
