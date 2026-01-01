"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Landmark } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaFooter,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { canUserJoin } from "@/lib/guild/utils";
import { useProfile } from "@/hooks/queries/use-profile";
import { Alert, AlertTitle } from "@/components/ui/alert";

type DetailModalProps = {
  showDetail: boolean;
  setShowDetail: Dispatch<SetStateAction<boolean>>;
  setShowRequestModal: Dispatch<SetStateAction<boolean>>;
  selected: {
    name: string;
    emblem: string;
    description: string;
    maxMembers: number;
    minRF: number;
    vaultLevel: number;
    totalSharePoints: number;
    requireApproval: boolean;
    _count: { members: number };
  };
};

const DetailModal = ({
  selected,
  setShowDetail,
  showDetail,
  setShowRequestModal,
}: DetailModalProps) => {
  const { data: profile } = useProfile();

  const { canJoin, reason } = canUserJoin({
    guild: {
      maxMembers: selected.maxMembers,
      minRF: selected.minRF,
      noOfMembers: selected._count.members,
    },
    hasActiveMembership: !!profile?.guildMembership,
    userRF: profile?.resonanceFidelity || 0,
  });

  return (
    <Credenza open={showDetail} onOpenChange={setShowDetail}>
      <CredenzaContent className="max-w-lg p-4">
        <CredenzaHeader>
          <CredenzaTitle>{selected.name}</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{selected.emblem}</div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {selected.description}
                </p>
                <div className="mt-2 text-sm">
                  Members: {selected._count.members}/{selected.maxMembers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Prestige Lv {selected.vaultLevel} • Vault{" "}
                  {selected.vaultLevel} • Territories{" "}
                  {/* {selected.territories.length} */}0
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">🎯 Activity This Week</h4>
              <p className="text-sm text-muted-foreground">
                {/* {selected.activeChallenges.length}  */}0 active challenges •{" "}
                {selected.totalSharePoints} SP earned
              </p>
            </div>

            <div>
              <h4 className="font-semibold">🎯 Requirements</h4>
              <p className="text-sm text-muted-foreground">
                Min RF: {selected.minRF} • Approval required:{" "}
                {selected.requireApproval ? "Yes" : "No"}
              </p>
            </div>
            {reason && (
              <Alert>
                <Landmark />
                <AlertTitle>{reason}</AlertTitle>
              </Alert>
            )}
          </div>
        </CredenzaBody>
        <CredenzaFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDetail(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setShowRequestModal(true);
              setShowDetail(false);
            }}
            disabled={!canJoin}
          >
            {selected.requireApproval ? "Request to Join" : "Join Instantly"}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default DetailModal;
