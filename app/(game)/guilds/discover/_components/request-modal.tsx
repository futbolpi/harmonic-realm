"use client";

import { useTransition, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaFooter,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import { joinGuild } from "@/actions/guilds/join-guild";
import { canUserJoin } from "@/lib/guild/utils";

type RequestModalProps = {
  showRequestModal: boolean;
  setShowRequestModal: Dispatch<SetStateAction<boolean>>;
  setShowDetail?: Dispatch<SetStateAction<boolean>>;
  guild: {
    minRF: number;
    requireApproval: boolean;
    id: string;
    maxMembers: number;
    _count: { members: number };
  };
};

const RequestModal = ({
  showRequestModal,
  setShowRequestModal,
  guild,
  setShowDetail,
}: RequestModalProps) => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const sendRequest = () => {
    if (!accessToken || !profile) {
      toast.error("Unauthorized");
      return;
    }

    const { canJoin, reason } = canUserJoin({
      guild: {
        minRF: guild.minRF,
        maxMembers: guild.maxMembers,
        noOfMembers: guild._count.members,
      },
      hasActiveMembership: !!profile.guildMembership?.isActive,
      userRF: profile.resonanceFidelity,
    });

    if (!canJoin) {
      toast.error(reason);
      return;
    }

    startTransition(async () => {
      try {
        const result = await joinGuild({
          accessToken,
          guildId: guild.id,
        });

        if (result.success) {
          refreshProfile();
          setShowRequestModal(false);
          setShowDetail?.(false);
          toast.success(
            "✓ Request Sent! Guild leadership will review your request."
          );
          router.push(`/guilds/${result.data?.id}`);
        } else {
          toast.error(result.error || "Failed to send request");
        }
      } catch (error) {
        console.error("Request error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Credenza open={showRequestModal} onOpenChange={setShowRequestModal}>
      <CredenzaContent className="max-w-md p-4">
        <CredenzaHeader>
          <CredenzaTitle>Request to Join</CredenzaTitle>
        </CredenzaHeader>

        <CredenzaFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRequestModal(false)}>
            Cancel
          </Button>
          <Button onClick={sendRequest} disabled={isLoading}>
            Send Request
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default RequestModal;
