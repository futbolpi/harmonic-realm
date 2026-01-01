"use client";

import type { Dispatch, SetStateAction } from "react";
import { formatDistanceToNow } from "date-fns";

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
import type { GuildMember } from "@/lib/generated/prisma/browser";

type ProfileModalProps = {
  showProfile: boolean;
  isLeader: boolean;
  setShowProfile: Dispatch<SetStateAction<boolean>>;
  selectedMember: GuildMember | null;
  handleAction: (
    member: GuildMember,
    type: "PROMOTE" | "REMOVE" | "DEMOTE"
  ) => void;
};

const ProfileModal = ({
  setShowProfile,
  showProfile,
  selectedMember,
  handleAction,
  isLeader,
}: ProfileModalProps) => {
  return (
    <Credenza open={showProfile} onOpenChange={setShowProfile}>
      <CredenzaContent className="max-w-md p-4">
        <CredenzaHeader>
          <CredenzaTitle>{selectedMember?.username}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          {selectedMember && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <UserAvatar size={64} userId={selectedMember.username} />
                <div>
                  <p className="font-semibold">{selectedMember.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Member • Joined{" "}
                    {formatDistanceToNow(selectedMember.joinedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Guild Contributions</p>
                <p className="text-sm text-muted-foreground">
                  Lifetime: {selectedMember.vaultContribution ?? 0} RES • This
                  Week: {selectedMember.weeklySharePoints ?? 0} SP
                </p>
              </div>
            </div>
          )}
        </CredenzaBody>
        <CredenzaFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowProfile(false)}>
            Close
          </Button>
          {isLeader && selectedMember?.role === "MEMBER" && (
            <Button onClick={() => handleAction(selectedMember, "PROMOTE")}>
              Promote to Officer
            </Button>
          )}
          {/* {isLeader && //|| profile?.role === "OFFICER")
            selectedMember && (
              <Button
                variant="destructive"
                onClick={() => handleRemove(selectedMember)}
              >
                Remove
              </Button>
            )} */}
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default ProfileModal;
