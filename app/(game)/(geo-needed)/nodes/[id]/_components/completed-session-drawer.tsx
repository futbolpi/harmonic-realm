"use client";

import { CheckCircle, Coins, Clock, Star, HandCoins } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Credenza,
  CredenzaContent,
  CredenzaTitle,
  CredenzaHeader,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaBody,
} from "@/components/credenza";
import { Node } from "@/lib/schema/node";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";

type CompletedSessionDrawerProps = { node: Node };

export function CompletedSessionDrawer({ node }: CompletedSessionDrawerProps) {

  const { data } = useMiningSessionAssets(node.id);

  
  const sessionData = data?.session;

  if (sessionData?.status !== "COMPLETED") {
    return null;
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button size="icon" className="shadow-lg rounded-full">
          <HandCoins className="h-4 w-4" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="border-t-0">
        <CredenzaHeader className="text-center pb-2">
          <CredenzaTitle className="flex items-center justify-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Session Complete!
          </CredenzaTitle>
        </CredenzaHeader>

        <CredenzaBody className="space-y-4 p-4 max-w-3xl max-h-96 overflow-y-auto">
          {/* Success Animation Area */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Congratulations!
            </h3>
            <p className="text-sm text-muted-foreground">
              You&apos;ve successfully completed your mining session
            </p>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 text-center">
            <Coins className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              +{sessionData.minerSharesEarned}
            </div>
            <div className="text-sm text-muted-foreground">
              Miner Shares Earned
            </div>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-lg p-3 text-center">
              <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{node.type.lockInMinutes}</div>
              <div className="text-xs text-muted-foreground">Minutes</div>
            </div>
            <div className="bg-card rounded-lg p-3 text-center">
              <Star className="h-4 w-4 text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold">+25</div>
              <div className="text-xs text-muted-foreground">XP Gained</div>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-700 border-green-500/20"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {sessionData.status}
            </Badge>
          </div>

          {/* Actions */}
          <div className="space-y-2">
              <CredenzaClose asChild>
             <Button
              className="w-full"
              variant="default"
            >
              Continue Exploring
            </Button>
            </CredenzaClose>
           
            <Button
             asChild
              className="w-full"
              variant="outline"
            >
              <Link href="/dashboard">View Stats</Link>     
            </Button>
          </div>

          {/* Achievement Hint */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <p className="text-xs text-purple-700 text-center">
              🎉 Keep mining to unlock achievements and level up your mining
              skills!
            </p>
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
