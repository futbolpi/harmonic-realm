"use client";

import type { Dispatch, SetStateAction } from "react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { TrendingUp, Gift, Zap } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaContent,
  CredenzaFooter,
} from "@/components/credenza";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { GuildMember } from "@/lib/generated/prisma/browser";

type ProfileModalProps = {
  showProfile: boolean;
  isLeader: boolean;
  setShowProfile: Dispatch<SetStateAction<boolean>>;
  selectedMember: GuildMember | null;
  handleAction: (
    member: GuildMember,
    type: "PROMOTE" | "REMOVE" | "DEMOTE",
  ) => void;
};

const ProfileModal = ({
  setShowProfile,
  showProfile,
  selectedMember,
  handleAction,
  isLeader,
}: ProfileModalProps) => {
  const daysSinceJoin = selectedMember
    ? differenceInDays(Date.now(), selectedMember.joinedAt)
    : 0;

  return (
    <Credenza open={showProfile} onOpenChange={setShowProfile}>
      <CredenzaContent className="max-w-md p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-background/75 to-background/90 p-6">
          <CredenzaHeader className="p-0 mb-4">
            <CredenzaTitle className="text-foreground text-2xl">
              {selectedMember?.username}
            </CredenzaTitle>
          </CredenzaHeader>
          <div className="flex items-center gap-4">
            <UserAvatar size={72} userId={selectedMember?.username || ""} />
            <div>
              <Badge className="mb-2">{selectedMember?.role}</Badge>
              <p className="text-sm text-muted-foreground">
                Member for {daysSinceJoin} day{daysSinceJoin !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <CredenzaBody className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {selectedMember && (
            <>
              {/* Contributions Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Contributions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      Lifetime RES
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {(selectedMember.vaultContribution ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      This Week SP
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {(selectedMember.weeklySharePoints ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Activity Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Activity
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-sidebar rounded">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium">
                      {formatDistanceToNow(selectedMember.joinedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-sidebar rounded">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="outline"
                      className={`${
                        (selectedMember.weeklySharePoints ?? 0) > 0
                          ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {(selectedMember.weeklySharePoints ?? 0) > 0
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stats Overview */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between p-2 bg-sidebar rounded">
                    <span className="text-muted-foreground">Avg Weekly</span>
                    <span className="font-medium">
                      {daysSinceJoin > 0
                        ? Math.round(
                            ((selectedMember.vaultContribution ?? 0) /
                              daysSinceJoin) *
                              7,
                          )
                        : 0}{" "}
                      RES
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-sidebar rounded">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">Day {daysSinceJoin}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CredenzaBody>

        <CredenzaFooter className="border-t p-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowProfile(false)}
            className="flex-1"
          >
            Close
          </Button>
          {isLeader && selectedMember?.role === "MEMBER" && (
            <Button
              onClick={() => handleAction(selectedMember, "PROMOTE")}
              className="flex-1"
            >
              Promote to Officer
            </Button>
          )}
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default ProfileModal;
