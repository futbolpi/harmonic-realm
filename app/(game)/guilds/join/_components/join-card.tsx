"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/shared/auth/auth-context";
import { useProfile } from "@/hooks/queries/use-profile";
import RequestModal from "@/app/(game)/guilds/discover/_components/request-modal";
import { canUserJoin } from "@/lib/guild/utils";
import { joinGuild } from "@/actions/guilds/join-guild";

type Props = {
  guild: {
    id: string;
    name: string;
    maxMembers: number;
    minRF: number;
    requireApproval: boolean;
    _count: { members: number };
  };
};

const JoinCard = ({ guild }: Props) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const slotsLeft = guild.maxMembers - guild._count.members;

  const { canJoin, reason } = canUserJoin({
    hasActiveMembership: !!profile?.guildMembership?.isActive,
    guild: {
      minRF: guild.minRF,
      maxMembers: guild.maxMembers,
      noOfMembers: guild._count.members,
    },
    userRF: profile?.resonanceFidelity ?? 0,
  });

  const handleInstantJoin = () => {
    if (!accessToken || !profile)
      return toast.error("You must be signed in to join");
    if (!canJoin) return toast.error(reason);

    startTransition(async () => {
      try {
        const res = await joinGuild({ accessToken, guildId: guild.id });
        if (res.success) {
          refreshProfile();
          toast.success(`✓ Joined ${guild.name}`);
          router.push(`/guilds/${guild.id}`);
        } else {
          toast.error(res.error || "Failed to join guild");
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              {guild.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {slotsLeft} slot{slotsLeft === 1 ? "" : "s"} available • Min RF{" "}
              {guild.minRF} •{" "}
              {guild.requireApproval ? "Approval required" : "Open to join"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!canJoin && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Unable to Join</AlertTitle>
            <AlertDescription>
              {reason}. If you think this is an error, verify your profile or
              contact guild leadership.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-1">
              Joining {guild.name} will add you to the guild roster and unlock
              social and vault features.
            </p>
            <div className="text-xs text-muted-foreground">
              Tip: maintain RF above {guild.minRF} to be eligible for upgrades.
            </div>
          </div>

          <div className="flex gap-2">
            {guild.requireApproval ? (
              <>
                <Button
                  onClick={() => setShowRequestModal(true)}
                  disabled={!canJoin}
                >
                  Request to Join
                </Button>
              </>
            ) : (
              <Button
                onClick={handleInstantJoin}
                disabled={!canJoin || isPending}
              >
                {isPending ? "Joining..." : "Join Instantly"}
              </Button>
            )}
          </div>
        </div>

        <RequestModal
          showRequestModal={showRequestModal}
          setShowRequestModal={setShowRequestModal}
          guild={{
            id: guild.id,
            minRF: guild.minRF,
            requireApproval: guild.requireApproval,
            maxMembers: guild.maxMembers,
            _count: { members: guild._count.members },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default JoinCard;
