"use client";

import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Crown, Star } from "lucide-react";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/shared/auth/auth-context";
import type { GuildMember } from "@/lib/generated/prisma/browser";

type LeadershipCardProps = {
  leader?: GuildMember;
  officers: GuildMember[];
  openProfile: (member: GuildMember) => void;
  handleAction: (
    member: GuildMember,
    type: "PROMOTE" | "REMOVE" | "DEMOTE",
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
    <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div>
            <CardTitle>Leadership</CardTitle>
            <CardDescription>Guild leader and officers</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guild Leader */}
        {leader && (
          <div className="p-4 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-3">
              <div className="relative">
                <UserAvatar size={56} userId={leader.username} />
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  👑
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-amber-900 dark:text-amber-100 truncate">
                  {leader.username}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                    Guild Leader
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Joined{" "}
                    {formatDistanceToNow(leader.joinedAt, { addSuffix: true })}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openProfile(leader)}
              className="w-full"
            >
              View Profile
            </Button>
          </div>
        )}

        {/* Officers */}
        {officers.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              {officers.length} Officer{officers.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-3">
              {officers.map((o) => (
                <div
                  key={o.id}
                  className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="relative">
                      <UserAvatar size={40} userId={o.username} />
                      <Star className="absolute -bottom-1 -right-1 w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 truncate">
                        {o.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {differenceInDays(Date.now(), o.joinedAt)} days
                        ago
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openProfile(o)}
                      className="flex-1 text-xs"
                    >
                      View
                    </Button>
                    {isLeader && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(o, "DEMOTE")}
                        className="text-xs"
                      >
                        Demote
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadershipCard;
