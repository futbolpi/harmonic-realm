"use client";

import { CheckCircle, Coins, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { piPayment } from "@/lib/pi/pi-payment";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { PaymentStatus } from "@/lib/generated/prisma/enums";
import { useAuth } from "@/components/shared/auth/auth-context";

type ContributionCardFooterProps = {
  contribution: {
    paymentStatus: PaymentStatus;
    piContributed: number;
    id: string;
    userId: string;
    gamePhaseId: number;
  };
};

const ContributionCardFooter = ({
  contribution: { paymentStatus, piContributed, id, gamePhaseId, userId },
}: ContributionCardFooterProps) => {
  const [isPending, startTransition] = useTransition();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const router = useRouter();

  const { user, logout } = useAuth();

  useEffect(() => {
    // Initialize Pi SDK
    const initPi = async () => {
      try {
        await piPayment.initializePiSDK();
      } catch (error) {
        console.error("Failed to initialize Pi SDK:", error);
        toast.error("Failed to initialize payment system");
      }
    };

    initPi();
  }, []);

  const handlePayment = () => {
    startTransition(async () => {
      try {
        setPaymentProcessing(true);
        await piPayment.createCalibrationPayment(
          id,
          piContributed,
          gamePhaseId
        );

        // Refresh page to check for payment status updates
        setTimeout(() => {
          setPaymentProcessing(false);
          router.refresh();
        }, 60000);
      } catch (error) {
        console.error("Payment failed:", error);
        setPaymentProcessing(false);

        if (error instanceof Error) {
          if (error.name === "PiPaymentError") {
            toast.error("Session expired, please sign in again.");
            logout();
            return;
          }
        }

        toast.error("Payment failed. Please try again.");
      }
    });
  };

  if (userId !== user?.piId) {
    return null;
  }

  return (
    <CardFooter>
      {paymentStatus === "PENDING" ? (
        <Button
          onClick={handlePayment}
          disabled={isPending || paymentProcessing}
          className="w-full game-button"
        >
          {isPending || paymentProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Coins className="h-4 w-4 mr-2" />
          )}
          {isPending || paymentProcessing
            ? "Processing..."
            : `Pay ${piContributed.toFixed(2)} Pi`}
        </Button>
      ) : paymentStatus === "COMPLETED" ? (
        <Button
          onClick={() => router.push("/lattice-calibration")}
          className="w-full game-button"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Contribution Complete
        </Button>
      ) : (
        <Button
          onClick={handlePayment}
          disabled={isPending}
          className="w-full game-button"
        >
          <Coins className="h-4 w-4 mr-2" />
          Retry Payment
        </Button>
      )}
    </CardFooter>
  );
};

export default ContributionCardFooter;
