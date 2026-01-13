"use client";

import { Crown, Users, Shield, Sword } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/queries/use-profile";
import type { GuildRole } from "@/lib/generated/prisma/enums";
import TerritoryControlActions from "./control-actions";
import { calculateMinStake } from "@/lib/guild/territories";

interface Props {
  territory: {
    currentStake: number;
    daysRemaining: number;
    centerLat: number;
    centerLon: number;
    hexId: string;
    activeChallenge: boolean;
    trafficScore: number;
    guild: {
      id: string;
      name: string;
      tag: string;
      members: {
        username: string;
        role: GuildRole;
      }[];
    } | null;
  };
}

export default function TerritoryControlSection({ territory }: Props) {
  const { data: profile } = useProfile();
  const userGuildId = profile?.guildMembership?.guildId;
  const isGuildMember = territory.guild?.id === userGuildId;

  if (!territory.guild) {
    return (
      <Card className="p-6 bg-slate-500/5 border-slate-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-foreground">Unclaimed Territory</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This territory is available for claiming. Guilds can stake RESONANCE
          to control it and earn bonuses for all members.
        </p>
        <div className="bg-slate-500/10 rounded-lg p-3 border border-slate-500/20">
          <p className="text-xs text-muted-foreground font-mono">
            Minimum Stake Required: {calculateMinStake(territory.trafficScore)}
          </p>
        </div>
        <TerritoryControlActions
          territory={{
            centerLat: territory.centerLat,
            centerLon: territory.centerLon,
            currentStake: territory.currentStake,
            guild: territory.guild,
            hexId: territory.hexId,
            trafficScore: territory.trafficScore,
          }}
          type="claim"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Guild Control Info */}
      <Card className="p-6 bg-emerald-500/5 border-emerald-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-foreground">Controlled By</h3>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-bold text-emerald-600">
            {territory.guild.name}
          </p>
          {territory.guild.tag && (
            <p className="text-xs text-muted-foreground font-mono">
              [{territory.guild.tag}]
            </p>
          )}
        </div>

        <Separator className="bg-border/20" />

        {/* Guild Members */}
        {territory.guild.members?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Guild Members ({territory.guild.members.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {territory.guild.members.slice(0, 3).map((member) => (
                <Badge
                  key={member.username}
                  variant="secondary"
                  className="text-xs"
                >
                  {member.username}
                </Badge>
              ))}
              {territory.guild.members.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{territory.guild.members.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator className="bg-border/20" />

        {/* Control Status */}
        <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20 space-y-2">
          <p className="text-xs font-semibold text-emerald-700">
            Control Status
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Days Remaining:</span>
              <span className="font-bold text-emerald-600">
                {territory.daysRemaining} days
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Current Stake:</span>
              <span className="font-bold text-emerald-600">
                {Math.round(territory.currentStake)} RESONANCE
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Challenge Section */}
      {!isGuildMember && territory.guild && !territory.activeChallenge && (
        <TerritoryControlActions
          territory={{
            centerLat: territory.centerLat,
            trafficScore: territory.trafficScore,
            centerLon: territory.centerLon,
            currentStake: territory.currentStake,
            guild: territory.guild,
            hexId: territory.hexId,
          }}
          type="challenge"
        />
      )}

      {/* Active Challenge Warning */}
      {territory.activeChallenge && (
        <Card className="p-4 bg-red-500/5 border-red-500/20">
          <div className="flex items-start gap-2">
            <Sword className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-600">
                Territory Under Attack
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                A challenge is currently active. Battle until resolution.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
