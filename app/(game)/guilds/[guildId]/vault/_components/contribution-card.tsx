"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Diamond, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useProfile } from "@/hooks/queries/use-profile";
import { calculatePercentage } from "@/lib/utils";
import { useAuth } from "@/components/shared/auth/auth-context";
import { depositToVault } from "@/actions/vaults/deposit";
import { canUserDeposit } from "@/lib/guild/utils";
import { Alert, AlertTitle } from "@/components/ui/alert";

type ContributionCardProps = {
  guild: {
    totalContributed: number;
    id: string;
    piTransactionId: string | null;
  };
  projectedDistribution: number;
};

const ContributionCard = ({
  guild,
  projectedDistribution,
}: ContributionCardProps) => {
  const [isDepositing, startTransition] = useTransition();

  const { data: profile } = useProfile();
  const balance = profile?.sharePoints || 0;

  const [selected, setSelected] = useState<number>(
    Math.min(500, Math.max(0, Math.floor(balance * 0.1)))
  );

  const { accessToken } = useAuth();

  const quickAmounts = [100, 250, 500, Math.round(balance)];

  const handleQuick = (amt: number) => setSelected(amt);

  const handleDeposit = () => {
    if (!accessToken) {
      toast.error("Unauthorized");
      return;
    }

    if (selected < 1) {
      toast.error("Enter an amount greater than 1");
      return;
    }

    if (selected > balance) {
      toast.error("⚠️ Insufficient balance");
      return;
    }

    startTransition(async () => {
      try {
        const response = await depositToVault({
          accessToken,
          guildId: guild.id,
          amount: selected,
        });
        if (!response.success) {
          toast.error(response.error || "Deposit failed");
        } else {
          toast.success(`✓ ${selected} SP deposited`);
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.35 } });
        }
      } catch (error) {
        console.log({ error });
        toast.error("Deposit failed");
      }
    });
  };

  const personalContribution = profile?.guildMembership?.vaultContribution || 0;

  const pctContribution = calculatePercentage(
    personalContribution,
    guild.totalContributed
  );

  const { canDeposit, reason } = canUserDeposit({
    depositAmount: selected,
    guild: { id: guild.id, piTransactionId: guild.piTransactionId },
    user: {
      sharePoints: balance,
      guildId: profile?.guildMembership?.guildId || null,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Your Contribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guild.totalContributed === 0 && (
            <Alert>
              <Diamond />
              <AlertTitle>
                Your guild vault is empty. Be the first to contribute!
              </AlertTitle>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            You&apos;ve deposited: {personalContribution.toLocaleString()} SP (
            {pctContribution}%)
          </p>
          <p className="text-sm text-muted-foreground">
            Projected distribution: ~{projectedDistribution} SP
          </p>

          <div>
            <div className="mb-2 text-sm">
              Your Balance:{" "}
              <span className="font-semibold">
                {balance.toLocaleString()} SP
              </span>
            </div>
            <Slider
              value={[selected]}
              min={1}
              max={Math.max(1, Math.round(balance))}
              onValueChange={(v) => setSelected(v[0])}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">{selected} SP</div>
              <div className="flex gap-2">
                {quickAmounts.map((q) => (
                  <Button
                    key={q}
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuick(q)}
                    disabled={q > balance}
                  >
                    {q === Math.round(balance) ? "MAX" : q}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Button
              onClick={handleDeposit}
              disabled={isDepositing || !canDeposit}
              className="w-full"
            >
              {isDepositing ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : !canDeposit ? (
                reason ?? "Unauthorized"
              ) : (
                "Deposit to Vault"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            💡 Deposits fund upgrades and weekly distributions to active members
            based on contribution.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionCard;
