// components/lore/StakingSection.tsx (Client for Form)
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { Decimal } from "@prisma/client/runtime/library";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { initiateLocationLoreStaking } from "@/actions/location-lore/initiate-staking";
import { useAuth } from "@/components/shared/auth/auth-context";

const stakeSchema = z.object({
  piAmount: z
    .number()
    .min(0.1, "Minimum stake is 0.1 Pi")
    .max(100, "Max stake is 100 Pi"),
});

interface StakingSectionProps {
  nodeId: string;
  currentLevel: number;
  totalPiStaked: Decimal;
}

export default function StakingSection({
  nodeId,
  currentLevel,
  totalPiStaked,
}: StakingSectionProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { accessToken } = useAuth();

  const form = useForm<z.infer<typeof stakeSchema>>({
    resolver: zodResolver(stakeSchema),
    defaultValues: { piAmount: 1 },
  });

  const onSubmit = (data: z.infer<typeof stakeSchema>) => {
    if (!accessToken) {
      toast.error("Unauthourized");
      return;
    }
    startTransition(async () => {
      const response = await initiateLocationLoreStaking({
        nodeId,
        piAmount: data.piAmount,
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

  const progress = (currentLevel / 5) * 100;
  const nextPiNeeded = [0.5, 1.5, 3, 5, 10][currentLevel] || 0; // Cumulative mocks

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Ritual of Patronage: Infuse Pi to Awaken Lore</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-4" />
        <p className="mb-4">
          Current Level: {currentLevel}/5 | Total Pi:{" "}
          {totalPiStaked.toDecimalPlaces(2).toString()}
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="piAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pi to Infuse (for next level: {nextPiNeeded} Pi)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Channeling..." : "Channel Pi Energy"}
            </Button>
          </form>
        </Form>
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
