"use client";

import { useTransition, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { GuildMember } from "@/lib/generated/prisma/browser";
import { updateRole } from "@/actions/guilds/update-role";
import { useAuth } from "@/components/shared/auth/auth-context";
import { removeMember } from "@/actions/guilds/remove-member";

type ConfirmAction = {
  type: "PROMOTE" | "REMOVE" | "DEMOTE";
  member: GuildMember;
} | null;

type ConfirmationModalProps = {
  confirmAction: ConfirmAction;
  setConfirmAction: Dispatch<SetStateAction<ConfirmAction>>;
};

const ConfirmationModal = ({
  confirmAction,
  setConfirmAction,
}: ConfirmationModalProps) => {
  const [isLoading, startTransition] = useTransition();

  const { accessToken } = useAuth();

  const confirmModalAction = () => {
    startTransition(async () => {
      if (!confirmAction || !accessToken) {
        return;
      }

      const defaultErrorMessage =
        confirmAction.type !== "REMOVE"
          ? "Member role update failed"
          : "Member removal failed";
      try {
        // Simulate creation and success
        const response =
          confirmAction.type === "REMOVE"
            ? await removeMember({
                accessToken,
                memberId: confirmAction.member.id,
              })
            : await updateRole({
                accessToken,
                memberId: confirmAction.member.id,
                role: confirmAction.type === "PROMOTE" ? "OFFICER" : "MEMBER",
              });
        if (!response.success) {
          toast.error(response.error || defaultErrorMessage);
        } else {
          const successMessage =
            confirmAction.type === "REMOVE"
              ? `${confirmAction.member.username} removed from guild`
              : `${confirmAction.member.username} ${
                  confirmAction.type === "PROMOTE"
                    ? "promoted to Officer"
                    : "demoted to Member"
                }`;
          toast.success(successMessage);
          setConfirmAction(null);
        }
      } catch (err) {
        console.log({ err });
        toast.error(defaultErrorMessage);
      }
    });
  };
  return (
    <Credenza
      open={!!confirmAction}
      onOpenChange={() => setConfirmAction(null)}
    >
      <CredenzaContent className="max-w-sm p-4">
        <CredenzaHeader>
          <CredenzaTitle>
            {confirmAction?.type === "PROMOTE"
              ? "Promote to Officer"
              : confirmAction?.type === "DEMOTE"
              ? "Demote to Member"
              : "Remove from Guild"}
          </CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <div>
            <p className="text-sm">
              {confirmAction?.type === "PROMOTE"
                ? `Promote ${confirmAction?.member.username} to Officer?`
                : confirmAction?.type === "DEMOTE"
                ? `Demote ${confirmAction?.member.username} to Member?`
                : `Remove ${confirmAction?.member.username} from guild? This cannot be undone.`}
            </p>
          </div>
        </CredenzaBody>
        <CredenzaFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>

          {confirmAction?.type && (
            <Button
              disabled={isLoading}
              onClick={confirmModalAction}
              className="capitalize"
              variant={
                confirmAction.type === "DEMOTE" ? "destructive" : "default"
              }
            >
              {confirmAction.type}
            </Button>
          )}
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default ConfirmationModal;
