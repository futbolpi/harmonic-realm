import { Coins, Zap, CheckCircle, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContributionTier, PaymentStatus } from "@/lib/generated/prisma/enums";
import ContributionCardFooter from "./contribution-card-footer";
import BackButton from "./back-button";

type ContributionDetail = {
  id: string;
  userId: string;
  gamePhaseId: number;
  contributionTier: ContributionTier;
  latitudeBin: number;
  longitudeBin: number;
  piContributed: number;
  paymentStatus: PaymentStatus;
  createdAt: Date;
};

interface ContributionDetailClientProps {
  contribution: ContributionDetail;
}

export default function ContributionDetailClient({
  contribution,
}: ContributionDetailClientProps) {
  const getStatusDisplay = () => {
    switch (contribution.paymentStatus) {
      case "COMPLETED":
        return (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Payment Completed</span>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            <span>Payment Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-amber-500">
            <Zap className="h-5 w-5" />
            <span>Payment Pending</span>
          </div>
        );
    }
  };

  const getTierColor = (tier: ContributionTier) => {
    const tierColors: Record<ContributionTier, string> = {
      ECHO_SUPPORTER: "bg-blue-500/10 text-blue-700 border-blue-200",
      RESONANCE_PATRON: "bg-purple-500/10 text-purple-700 border-purple-200",
      COSMIC_FOUNDER: "bg-orange-500/10 text-orange-700 border-orange-200",
      LATTICE_ARCHITECT: "bg-pink-500/10 text-pink-700 border-pink-200",
    };
    return (
      tierColors[tier] || "bg-slate-500/10 text-slate-700 border-slate-200"
    );
  };

  return (
    <div className="container max-w-md mx-auto p-4">
      <BackButton />

      <Card className="border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Awakening Contribution
          </CardTitle>
          <CardDescription>
            Complete your payment to activate the lattice calibration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contribution details */}
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Contribution Amount:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">
                  {contribution.piContributed.toFixed(2)} Pi
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Recognition Tier:</span>
              <Badge className={getTierColor(contribution.contributionTier)}>
                {contribution.contributionTier.replace("_", " ")}
              </Badge>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Contributed at:</span>
              <span className="text-xs">
                {new Date(contribution.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Location info */}
          <div className="rounded-lg bg-accent/5 p-4 border border-accent/10">
            <h3 className="font-medium mb-2 text-sm">Binned Location</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Latitude:</span>
                <p className="font-mono font-semibold">
                  {contribution.latitudeBin}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Longitude:</span>
                <p className="font-mono font-semibold">
                  {contribution.longitudeBin}
                </p>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className="rounded-lg bg-secondary/5 p-4 border border-secondary/10">
            <h3 className="font-medium mb-2 text-sm">Payment Status</h3>
            {getStatusDisplay()}
          </div>
        </CardContent>

        <ContributionCardFooter contribution={contribution} />
      </Card>
    </div>
  );
}
