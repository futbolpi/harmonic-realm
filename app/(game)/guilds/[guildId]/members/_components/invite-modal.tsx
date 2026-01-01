"use client";

import { toast } from "sonner";

import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { getPiSDK } from "@/components/shared/pi/pi-sdk";
import { useAuth } from "@/components/shared/auth/auth-context";
import { Share2 } from "lucide-react";

type InviteModalProps = {
  maxMembers: number;
  noOfMembers: number;
  guildId: string;
};

const InviteModal = ({
  maxMembers,
  noOfMembers,
  guildId,
}: InviteModalProps) => {
  const { logout } = useAuth();

  const inviteLink = `${env.NEXT_PUBLIC_PINET_URL}/guilds/join?guildId=${guildId}`;

  const copyInvite = async () => {
    try {
      const piSDK = getPiSDK();
      await piSDK.openShareDialog("Guild Invite Link", inviteLink);
    } catch (error) {
      console.log("share ERROR", { error });
      if (error instanceof Error) {
        // Inside this block, err is known to be a Error
        if (
          error.message === 'Cannot create a payment without "payments" scope'
        ) {
          logout();
          toast.error("Session expired, please sign in again.");
        }
      }
    }
  };

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button size={"icon"} className="rounded-2xl">
          <Share2 />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-md p-4">
        <CredenzaHeader>
          <CredenzaTitle>Invite to Guild</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="space-y-3">
            <div className="text-sm">
              Current: {noOfMembers} / {maxMembers} members
            </div>
            <div className="p-3 border rounded">
              Share this link to invite new members:
            </div>
            <div className="flex gap-2 mt-2">
              <Input value={inviteLink} readOnly />
              <Button onClick={copyInvite}>Share</Button>
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button variant="ghost">Close</Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default InviteModal;
