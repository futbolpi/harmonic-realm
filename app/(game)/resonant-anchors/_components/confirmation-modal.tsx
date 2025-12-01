"use client";

import { Zap } from "lucide-react";
import Decimal from "decimal.js";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaBody,
} from "@/components/credenza";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  originalCost: Decimal | string | number;
  discountedCost: Decimal | string | number;
  discountLevels: number;
  pointsBurned: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onOpenChange,
  originalCost,
  discountedCost,
  discountLevels,
  pointsBurned,
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const savings = new Decimal(originalCost).minus(discountedCost);
  const savingsPercent = savings
    .dividedBy(originalCost)
    .times(100)
    .toDecimalPlaces(1)
    .toString();

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-md">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            Confirm Resonant Anchor
          </CredenzaTitle>
          <CredenzaDescription>
            Review your harmonic resonance investment
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-4 px-4 pb-4 max-h-[80vh] overflow-y-auto">
          {/* Cost Summary */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6 space-y-4">
              {/* Original vs Discounted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Base Cost
                  </span>
                  <span className="text-sm line-through text-muted-foreground">
                    {originalCost.toString()} π
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Final Cost</span>
                  <span className="text-2xl font-bold text-primary">
                    {discountedCost.toString()} π
                  </span>
                </div>
              </div>

              {/* Savings Highlight */}
              {pointsBurned > 0 && (
                <div className="rounded-lg bg-green-500/10 p-3 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      ✨ Total Savings
                    </span>
                    <div className="text-right">
                      <p className="font-bold text-green-700 dark:text-green-400">
                        {savings.toString()} π
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        {savingsPercent}% off
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Details */}
              {pointsBurned > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount Tiers Applied
                    </span>
                    <Badge variant="secondary">{discountLevels}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Resonance Points Burned
                    </span>
                    <span className="font-semibold text-amber-600">
                      {pointsBurned}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lore Message */}
          <div className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground italic">
            &quot;Your social resonance echoes across the Lattice. The
            Harmonizers recognize your contribution.&quot;
          </div>
        </CredenzaBody>

        <CredenzaFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Review Again
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Anchoring...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Anchor Now
              </span>
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
