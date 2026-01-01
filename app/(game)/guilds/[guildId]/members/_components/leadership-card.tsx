"use client";

import { formatDistanceToNow } from "date-fns";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/components/shared/auth/auth-context";
import type { GuildMember } from "@/lib/generated/prisma/browser";

type LeadershipCardProps = {
  leader?: GuildMember;
  officers: GuildMember[];
  openProfile: (member: GuildMember) => void;
  handleAction: (
    member: GuildMember,
    type: "PROMOTE" | "REMOVE" | "DEMOTE"
  ) => void;
};

const LeadershipCard = ({
  leader,
  officers,
  openProfile,
  handleAction,
}: LeadershipCardProps) => {
  const { user } = useAuth();
  const isLeader = user?.username === leader?.username;

  return (
    <Card>
      <CardHeader>
        <CardTitle>👑 Leadership</CardTitle>
        <CardDescription>Leader and officers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {leader && (
          <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar size={48} userId={leader.username} />
              <div>
                <p className="font-semibold">{leader.username}</p>
                <p className="text-xs text-muted-foreground">
                  Role: Guild Leader • Joined:{" "}
                  {formatDistanceToNow(leader.joinedAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => openProfile(leader)}>
                View Profile
              </Button>
            </div>
          </div>
        )}

        {officers.map((o) => (
          <div
            key={o.id}
            className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <UserAvatar size={40} userId={o.username} />
              <div>
                <p className="font-semibold">{o.username}</p>
                <p className="text-xs text-muted-foreground">
                  Role: Officer • Joined:{" "}
                  {Math.floor(
                    (Date.now() - new Date(o.joinedAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days ago
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => openProfile(o)}>
                View Profile
              </Button>
              {isLeader && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAction(o, "DEMOTE")}
                >
                  Demote
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LeadershipCard;
