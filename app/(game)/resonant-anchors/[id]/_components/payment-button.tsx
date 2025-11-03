"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Coins, Loader2 } from "lucide-react";

import { useAuth } from "@/components/shared/auth/auth-context";
import { Button } from "@/components/ui/button";
import { piPayment } from "@/lib/pi/pi-payment";

type PaymentButtonProps = {
  anchor: {
    id: string;
    userId: string;
    phaseNumber: number;
    piAmount: number;
  };
};

const PaymentButton = ({ anchor }: PaymentButtonProps) => {
  const { id: anchorId, phaseNumber, piAmount, userId } = anchor;
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
        await piPayment.createAnchorPayment(anchorId, phaseNumber, piAmount);

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
    <Button
      disabled={isPending || paymentProcessing}
      className="w-full game-button"
      onClick={handlePayment}
    >
      {isPending || paymentProcessing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Coins className="h-4 w-4 mr-2" />
      )}
      {isPending || paymentProcessing
        ? "Processing..."
        : `Pay ${piAmount.toFixed(2)} Pi`}
    </Button>
  );
};

export default PaymentButton;
