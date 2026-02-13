"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DriftStatus, type StatusInfo } from "@/lib/schema/drift";
import { getRemainingDiscounts } from "@/config/drift";

interface DriftStatusBannerProps {
  statusInfo: StatusInfo;
  driftCount?: number;
}

export function DriftStatusBanner({
  statusInfo,
  driftCount = 0,
}: DriftStatusBannerProps) {
  const remainingDiscounts = getRemainingDiscounts(driftCount);

  // Determine icon and variant based on status
  const getStatusConfig = () => {
    switch (statusInfo.status) {
      case DriftStatus.READY:
        return {
          icon: CheckCircle2,
          variant: "default" as const,
          iconColor: "text-green-500",
        };
      case DriftStatus.ON_COOLDOWN:
        return {
          icon: Clock,
          variant: "default" as const,
          iconColor: "text-amber-500",
        };
      case DriftStatus.CONTENT_ABUNDANT:
        return {
          icon: XCircle,
          variant: "destructive" as const,
          iconColor: "text-red-500",
        };
      case DriftStatus.NO_ELIGIBLE_NODES:
        return {
          icon: AlertCircle,
          variant: "default" as const,
          iconColor: "text-gray-500",
        };
      case DriftStatus.NO_LOCATION:
      default:
        return {
          icon: MapPin,
          variant: "default" as const,
          iconColor: "text-blue-500",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className="border-2">
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <AlertDescription className="ml-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{statusInfo.title}</span>
              {statusInfo.densityTier && (
                <Badge
                  variant={
                    statusInfo.densityTier.includes("Void") ||
                    statusInfo.densityTier.includes("Sparse")
                      ? "destructive"
                      : statusInfo.densityTier.includes("Low")
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {statusInfo.densityTier}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          {/* Quick stats */}
          {statusInfo.status === DriftStatus.READY && (
            <div className="text-right space-y-1">
              {statusInfo.cheapestCost !== undefined && (
                <div className="text-xs text-muted-foreground">
                  From{" "}
                  <span className="font-semibold text-foreground">
                    {statusInfo.cheapestCost} SP
                  </span>
                </div>
              )}
              {remainingDiscounts > 0 && (
                <Badge variant="outline" className="text-xs">
                  {remainingDiscounts} discount
                  {remainingDiscounts > 1 ? "s" : ""} left
                </Badge>
              )}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
