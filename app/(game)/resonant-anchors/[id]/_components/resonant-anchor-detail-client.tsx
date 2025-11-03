import Link from "next/link";
import { ArrowLeft, Zap, MapPin, Clock } from "lucide-react";
import type { Decimal } from "@prisma/client/runtime/client";

import type { PaymentStatus } from "@/lib/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentButton from "./payment-button";

interface ResonantAnchorDetailClientProps {
  anchor: {
    id: string;
    userId: string;
    phaseId: number;
    locationLat: number;
    locationLon: number;
    nodeId: string | null;
    piCost: Decimal;
    paymentStatus: PaymentStatus;
    createdAt: Date;
  };
}

/**
 * Client component for resonant anchor payment and details
 */
export default function ResonantAnchorDetailClient({
  anchor,
}: ResonantAnchorDetailClientProps) {
  const statusColor: Record<PaymentStatus, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    COMPLETED: "bg-green-500/10 text-green-700 dark:text-green-400",
    FAILED: "bg-red-500/10 text-red-700 dark:text-red-400",
    PROCESSING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    CANCELLED: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto max-w-2xl px-4 py-6 md:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Complete Your Anchoring
            </h1>
            <p className="text-sm text-muted-foreground">
              Finalize the π payment to spawn your node
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/resonant-anchors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Anchor Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Anchoring Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location */}
            <div className="flex items-start justify-between rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-xs text-muted-foreground">
                    {anchor.locationLat}, {anchor.locationLon}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="flex items-start justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div>
                <p className="text-sm font-medium">Anchor Cost</p>
                <p className="text-xs text-muted-foreground">
                  Dynamic cost based on phase and participation
                </p>
              </div>
              <span className="text-lg font-bold text-primary">
                {anchor.piCost.toString()} π
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge className={statusColor[anchor.paymentStatus]}>
                {anchor.paymentStatus}
              </Badge>
            </div>

            {/* Created Date */}
            <p className="text-xs text-muted-foreground">
              Created: {new Date(anchor.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Payment Section */}
        {anchor.paymentStatus === "PENDING" && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Pay the anchor cost to spawn your node
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentButton
                anchor={{
                  id: anchor.id,
                  phaseNumber: anchor.phaseId,
                  piAmount: anchor.piCost.toNumber(),
                  userId: anchor.userId,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {anchor.paymentStatus === "COMPLETED" && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="mb-4 text-lg font-bold text-green-600 dark:text-green-400">
                  Payment Confirmed!
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Your node has been anchored to the lattice.
                </p>
                {anchor.nodeId && (
                  <Button asChild>
                    <Link href={`/nodes/${anchor.nodeId}`}>View Your Node</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
