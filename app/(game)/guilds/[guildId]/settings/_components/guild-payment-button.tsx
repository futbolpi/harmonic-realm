"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { piPayment } from "@/lib/pi/pi-payment";
import { useAuth } from "@/components/shared/auth/auth-context";
import { GUILD_CREATION_FEE } from "@/config/guilds/constants";

export function GuildPaymentButton({
  guildId,
  disabled,
  leaderUsername,
}: {
  guildId: string;
  leaderUsername: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
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

  const handlePay = () => {
    startTransition(async () => {
      try {
        await piPayment.createGuildPayment(guildId);
        toast.success("Payment initiated — await confirmation.");
        // In real app we'd listen for webhook and refresh
        setTimeout(() => router.refresh(), 60000);
      } catch (error) {
        console.error("Payment failed:", error);

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

  if (leaderUsername !== user?.username) {
    return null;
  }

  return (
    <Button
      onClick={handlePay}
      disabled={isPending || disabled}
      className="game-button"
    >
      {isPending
        ? "Processing..."
        : `Pay Guild Creation Fee (${GUILD_CREATION_FEE})`}
    </Button>
  );
}
