"use client";

import { useEffect, useState } from "react";
import { useNextStep } from "nextstepjs";
import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  shouldShowWelcomeTour,
  shouldShowAdvancedTour,
} from "@/lib/tutorials/steps";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/hooks/queries/use-profile";

export function TutorialTrigger() {
  const { startNextStep } = useNextStep();
  const [showPrompt, setShowPrompt] = useState(false);
  const [availableTour, setAvailableTour] = useState<
    "welcome" | "advanced" | null
  >(null);
  const pathname = usePathname();

  const { data: profile } = useProfile();

  useEffect(() => {
    if (!profile) return;

    if (shouldShowWelcomeTour(profile)) {
      setAvailableTour("welcome");
      setShowPrompt(true);
    } else if (shouldShowAdvancedTour(profile)) {
      setAvailableTour("advanced");
      setShowPrompt(true);
    }
  }, [profile]);

  const handleStartTour = () => {
    if (availableTour) {
      startNextStep(availableTour);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !availableTour || pathname !== "/dashboard") return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 50,
        maxWidth: "24rem",
      }}
    >
      <Card
        className="shadow-2xl"
        style={{
          background:
            "color-mix(in srgb, var(--color-game-accent) 95%, transparent)",
          backdropFilter: "blur(4px)",
          border:
            "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
          borderRadius: "var(--radius-lg)",
          boxShadow:
            "0 0 30px color-mix(in srgb, var(--color-primary) 20%, transparent)",
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(to bottom right, var(--color-neon-purple), var(--color-neon-blue))",
                  borderRadius: "50%",
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "white" }} />
              </div>
              <CardTitle
                className="text-sm font-semibold"
                style={{ color: "var(--color-foreground)" }}
              >
                {availableTour === "welcome"
                  ? "New Pioneer Guide"
                  : "Advanced Training"}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
              style={{
                color: "var(--color-muted-foreground)",
                transition: "color 200ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-foreground)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription style={{ color: "var(--color-muted-foreground)" }}>
            {availableTour === "welcome"
              ? "Ready to learn the ways of the Lattice? Let us guide you through your first steps as a Pioneer."
              : "You've unlocked advanced Lattice techniques! Discover new ways to harness cosmic energy."}
          </CardDescription>
          <div className="flex gap-2">
            <Button
              onClick={handleStartTour}
              size="sm"
              className="flex-1"
              style={{
                background:
                  "linear-gradient(to right, var(--color-neon-purple), var(--color-neon-blue))",
                color: "white",
                border:
                  "1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)",
                boxShadow:
                  "0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                transition: "all 300ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 30px color-mix(in srgb, var(--color-primary) 50%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)";
              }}
            >
              Start Guide
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-muted-foreground)",
                background: "transparent",
                transition: "all 200ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-accent)";
                e.currentTarget.style.color = "var(--color-foreground)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
