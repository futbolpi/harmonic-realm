"use client";

import { UserStar, TrendingUp, Zap } from "lucide-react";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GuildMember } from "@/lib/generated/prisma/browser";

type ActiveMembersProps = {
  filtered: GuildMember[];
  activeCount: number;
  openProfile: (member: GuildMember) => void;
  handleAction: (
    member: GuildMember,
    type: "PROMOTE" | "REMOVE" | "DEMOTE",
  ) => void;
  isLeader: boolean;
};

const getActivityStatus = (
  weeklySharePoints: number | null,
): "active" | "inactive" => {
  return (weeklySharePoints ?? 0) > 0 ? "active" : "inactive";
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case "LEADER":
      return "bg-amber-600 hover:bg-amber-700";
    case "OFFICER":
      return "bg-blue-600 hover:bg-blue-700";
    default:
      return "bg-slate-600 hover:bg-slate-700";
  }
};

const ActiveMembers = ({
  filtered,
  activeCount,
  handleAction,
  openProfile,
  isLeader,
}: ActiveMembersProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Members
            </CardTitle>
            <CardDescription>
              {activeCount} active • {filtered.length} total members
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => {
              const activityStatus = getActivityStatus(m.weeklySharePoints);

              return (
                <div
                  key={m.id}
                  className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <UserAvatar size={44} userId={m.username} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {m.username}
                        </p>
                        <Badge
                          className={`text-white text-xs ${getRoleColor(m.role)}`}
                        >
                          {m.role}
                        </Badge>
                        {activityStatus === "active" && (
                          <Badge
                            variant="outline"
                            className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                          <p className="text-muted-foreground">This Week</p>
                          <p className="font-semibold">
                            {m.weeklySharePoints ?? 0} SP
                          </p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                          <p className="text-muted-foreground">Lifetime</p>
                          <p className="font-semibold">
                            {m.vaultContribution ?? 0} RES
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openProfile(m)}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      Profile
                    </Button>
                    {isLeader && m.role === "MEMBER" && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(m, "PROMOTE")}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <UserStar className="w-3 h-3 mr-1" />
                        Promote
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveMembers;
