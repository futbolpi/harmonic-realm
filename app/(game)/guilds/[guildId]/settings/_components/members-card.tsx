"use client";

import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useTransition } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/auth/auth-context";
import { removeMember } from "@/actions/guilds/remove-member";
import { acceptMember } from "@/actions/guilds/accept-member";

type Props = {
  autoKickInactive: boolean;
  isAuthorized: boolean;
  inActiveMembers: {
    username: string;
    id: string;
    joinedAt: Date;
    user: {
      resonanceFidelity: number;
    };
  }[];
};

const MembersCard = ({
  autoKickInactive,
  isAuthorized,
  inActiveMembers,
}: Props) => {
  const [isLoading, startTransition] = useTransition();

  const { accessToken } = useAuth();

  const confirmRequestAction = ({
    action,
    memberId,
  }: {
    action: "accept" | "decline";
    memberId: string;
  }) => {
    startTransition(async () => {
      if (!accessToken) {
        return;
      }

      const defaultErrorMessage =
        action === "accept" ? "Accept failed" : "Decline failed";
      try {
        // Simulate creation and success
        const response =
          action === "decline"
            ? await removeMember({
                accessToken,
                memberId,
              })
            : await acceptMember({
                accessToken,
                memberId,
              });
        if (!response.success) {
          toast.error(response.error || defaultErrorMessage);
        } else {
          const successMessage = action === "accept" ? "Accepted" : "Declined";
          toast.success(successMessage);
        }
      } catch (err) {
        console.log({ err });
        toast.error(defaultErrorMessage);
      }
    });
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Auto-Kick Inactive Members
            </p>
            <Switch
              checked={autoKickInactive}
              onCheckedChange={() => toast("Coming Soon!")}
            />
          </div>
          <div>
            <p className="text-sm">Join Requests</p>
            <div className="mt-2 space-y-2">
              {/* Mock pending */}
              {inActiveMembers.map((member) => (
                <div className="rounded-md border p-3" key={member.username}>
                  <div className="flex flex-col space-y-2 sm:flex-row items-start justify-between">
                    <div>
                      <p className="font-medium">{member.username}</p>
                      <p className="text-xs text-muted-foreground">
                        RF {member.user.resonanceFidelity} • Requested{" "}
                        {formatDistanceToNow(member.joinedAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={isLoading}
                        onClick={() =>
                          confirmRequestAction({
                            action: "decline",
                            memberId: member.id,
                          })
                        }
                      >
                        Decline
                      </Button>
                      <Button
                        disabled={isLoading}
                        onClick={() =>
                          confirmRequestAction({
                            action: "accept",
                            memberId: member.id,
                          })
                        }
                      >
                        Accept & Invite
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembersCard;
