"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
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
    type: "PROMOTE" | "REMOVE" | "DEMOTE"
  ) => void;
  isLeader: boolean;
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
        <CardTitle>💪 Active Members ({activeCount})</CardTitle>
        <CardDescription>Logged in within 7 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <UserAvatar size={40} userId={m.username} />
              <div>
                <p className="font-semibold">
                  {m.username}{" "}
                  <span className="text-xs text-muted-foreground">
                    • {m.role}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  This Week: {m.weeklySharePoints ?? 0} SP •{" "}
                  {m.vaultContribution ?? 0} RES
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => openProfile(m)}>
                View Profile
              </Button>
              {isLeader && m.role === "MEMBER" && (
                <Button onClick={() => handleAction(m, "PROMOTE")}>
                  Promote to Officer
                </Button>
              )}
              {/* ensure leader doesnt remove himself */}
              {/* {isLeader && ( //|| profile?.role === "OFFICER")
                <Button variant="destructive" onClick={() => handleAction(m,"REMOVE")}>
                  Remove
                </Button>
              )} */}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveMembers;
