"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { initiateLocationLoreStaking } from "@/actions/location-lore/initiate-staking";
import { useAuth } from "@/components/shared/auth/auth-context";

interface StakingSectionProps {
  nodeId: string;
  currentLevel: number;
  totalPiStaked: number;
}

export default function StakingSection({
  nodeId,
  currentLevel,
  totalPiStaked,
}: StakingSectionProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { accessToken } = useAuth();

  const progress = (currentLevel / 5) * 100;
  const piAmount = [0.5, 1.5, 3, 5, 10][currentLevel] || 0; // Cumulative mocks

  const disabled = piAmount < 0.5;

  const onSubmit = () => {
    if (!accessToken) {
      toast.error("Unauthourized");
      return;
    }
    if (disabled) {
      toast.error("Staking is not allowed for this node");
      return;
    }

    startTransition(async () => {
      const response = await initiateLocationLoreStaking({
        nodeId,
        piAmount,
        accessToken,
        targetLevel: currentLevel + 1,
      });
      if (!response.success) {
        toast.error(response.error || "Failed to initiate staking");
        return;
      }
      if (response.data) {
        // Redirect to the stake detail page
        toast.success(`Proceed to make payment for ${response.data.memo}`);
        router.push(`/lore-stakes/${response.data.stakeId}`);
      }
    });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Ritual of Patronage: Infuse Pi to Awaken Lore</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-4" />
        <p className="mb-4">
          Current Level: {currentLevel}/5 | Total Pi: {totalPiStaked.toFixed(2)}
        </p>
        <Button
          onClick={onSubmit}
          disabled={isPending || disabled}
          className="w-full"
        >
          {isPending ? "Channeling..." : `Channel Energy with ${piAmount} Pi`}
        </Button>
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Contribution Tiers</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Echo Supporter (0.1+ Pi): Early Access</li>
            <li>Resonance Patron (1+ Pi): Cosmetics + Recognition</li>
            <li>Lattice Architect (10+ Pi): Lore Name + Priority</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
