"use client";

import Link from "next/link";
import { useQueryState, parseAsStringLiteral } from "nuqs";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/components/shared/auth/auth-context";
import { GuildRole } from "@/lib/generated/prisma/enums";
import AdvancedCard from "./advanced-card";
import PaymentsCard from "./payments-card";
import MembersCard from "./members-card";
import BasicInfoCard from "./basic-info-card";
import PrivacyCard from "./privacy-card";

type Props = {
  guild: {
    id: string;
    name: string;
    leaderUsername: string;
    emblem: string;
    isPublic: boolean;
    description: string | null;
    requireApproval: boolean;
    autoKickInactive: boolean;
    minRF: number;
    tag: string;
    paymentId: string | null;
    piTransactionId: string | null;
    members: {
      username: string;
      id: string;
      role: GuildRole;
      isActive: boolean;
      joinedAt: Date;
      user: {
        resonanceFidelity: number;
      };
    }[];
  };
};

const tabs = ["general", "members", "payments", "advanced"] as const;
type Tab = (typeof tabs)[number];

export default function SettingsClient({ guild }: Props) {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabs).withDefault("general")
  );
  const { user } = useAuth();

  const isLeader = user?.username === guild.leaderUsername;
  const isOfficer = guild.members.some(
    (m) => m.username === user?.username && m.role === "OFFICER"
  );

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/guilds/${guild.id}`} className="text-muted-foreground">
            ← Back
          </Link>
          <h2 className="text-2xl font-bold">{guild.name} — Settings</h2>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as Tab)}
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="advanced" disabled>
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <BasicInfoCard
            guild={{
              description: guild.description || "",
              emblem: guild.emblem,
              name: guild.name,
              tag: guild.tag,
              id: guild.id,
            }}
            isLeader={isLeader}
            isOfficer={isOfficer}
          />
          <PrivacyCard
            isAuthorized={isLeader || isOfficer}
            guild={{
              isPublic: guild.isPublic,
              minRF: guild.minRF,
              requireApproval: guild.requireApproval,
              id: guild.id,
            }}
          />
        </TabsContent>

        <TabsContent value="members">
          <MembersCard
            autoKickInactive={guild.autoKickInactive}
            isAuthorized={isLeader || isOfficer}
            inActiveMembers={guild.members.filter((member) => !member.isActive)}
          />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsCard
            guild={{
              id: guild.id,
              leaderUsername: guild.leaderUsername,
              paymentId: guild.paymentId,
              piTransactionId: guild.piTransactionId,
            }}
            isLeader={isLeader}
          />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedCard isLeader={isLeader} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
