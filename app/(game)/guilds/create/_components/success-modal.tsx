"use client";

import { useRouter } from "next/navigation";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";

type Props = {
  showSuccess: boolean;
  guildId: string;
};

const SuccessModal = ({ showSuccess, guildId }: Props) => {
  const router = useRouter();

  return (
    <Credenza open={showSuccess}>
      <CredenzaContent className="max-w-md p-4">
        <CredenzaHeader>
          <CredenzaTitle>⚔️ ALREADY A GUILD LEADER!</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                You are already leading this guild!
              </p>
            </div>
            <div className="text-left space-y-1 bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium">Guild Leadership Limit</p>
              <p className="text-xs text-muted-foreground">
                You can only lead one guild at a time. To create a new guild,
                you must first transfer leadership or disband your current
                guild.
              </p>
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/guilds`);
            }}
          >
            Browse Guilds
          </Button>
          <Button
            onClick={() => {
              router.push(`/guilds/${guildId}`);
            }}
          >
            Go to My Guild
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default SuccessModal;
