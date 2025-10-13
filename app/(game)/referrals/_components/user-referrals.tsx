"use client";

import { toast } from "sonner";
import { Share2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useProfile } from "@/hooks/queries/use-profile";
import { getPiSDK } from "@/components/shared/pi/pi-sdk";
import { useAuth } from "@/components/shared/auth/auth-context";

export default function UserReferrals() {
  const {logout} = useAuth()
  const { data: userProfile } = useProfile();

  const referralLink = userProfile
    ? `${env.NEXT_PUBLIC_PINET_URL}/invite?ref=${userProfile.username}`
    : undefined;

  const onClick = async () => {
    if (!referralLink) {
      toast.error("You have no invite yet")
      return
    }

    try {
      const piSDK = getPiSDK();
      await piSDK.openShareDialog("Your Invite Link", referralLink);
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
    <div className="space-y-6">
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {userProfile?.noOfReferrals ?? 0} Referral(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <input
              type="text"
              value={referralLink ?? ""}
              readOnly
              className="flex-grow p-2 border rounded"
            />
              <Button onClick={onClick} variant="outline" disabled={!referralLink}>
                <Share2 className="h-4 w-4" />
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
