"use client";

import { X, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import type React from "react";
import { motion } from "framer-motion";
import { CardComponentProps } from "nextstepjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CustomNextStepCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
}: CardComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative z-50"
    >
      <Card
        style={{
          width: "320px",
          background:
            "color-mix(in srgb, var(--color-game-accent) 95%, transparent)",
          backdropFilter: "blur(8px)",
          border:
            "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px color-mix(in srgb, var(--color-primary) 20%, transparent)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <CardHeader style={{ paddingBottom: "12px" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step.icon && (
                <div
                  style={{
                    fontSize: "24px",
                    filter: "drop-shadow(0 0 8px var(--color-primary))",
                  }}
                >
                  {step.icon}
                </div>
              )}
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "var(--color-foreground)",
                    textShadow:
                      "0 0 10px color-mix(in srgb, var(--color-primary) 50%, transparent)",
                  }}
                >
                  {step.title}
                </h3>
                <Badge
                  variant="secondary"
                  style={{
                    fontSize: "12px",
                    background:
                      "color-mix(in srgb, var(--color-primary) 15%, transparent)",
                    color: "var(--color-primary)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  {currentStep + 1} of {totalSteps}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              style={{
                height: "32px",
                width: "32px",
                padding: "0",
                color: "var(--color-muted-foreground)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-foreground)";
                e.currentTarget.style.background =
                  "color-mix(in srgb, var(--color-muted) 50%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-muted-foreground)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <p
            style={{
              color: "var(--color-muted-foreground)",
              lineHeight: "1.6",
              fontSize: "14px",
            }}
          >
            {step.content}
          </p>

          {step.showControls && (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-muted-foreground)",
                  background: "transparent",
                  opacity: currentStep === 0 ? "0.5" : "1",
                }}
                onMouseEnter={(e) => {
                  if (currentStep !== 0) {
                    e.currentTarget.style.background = "var(--color-muted)";
                    e.currentTarget.style.color = "var(--color-foreground)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentStep !== 0) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color =
                      "var(--color-muted-foreground)";
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                {step.showSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    style={{
                      color: "var(--color-muted-foreground)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-foreground)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        "var(--color-muted-foreground)";
                    }}
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip
                  </Button>
                )}

                <Button
                  onClick={nextStep}
                  size="sm"
                  style={{
                    background:
                      "linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 80%, var(--color-neon-blue)))",
                    color: "var(--color-primary-foreground)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)",
                    boxShadow:
                      "0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                    transition: "all 300ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(to right, color-mix(in srgb, var(--color-primary) 120%, white), var(--color-primary))";
                    e.currentTarget.style.boxShadow =
                      "0 0 30px color-mix(in srgb, var(--color-primary) 50%, transparent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 80%, var(--color-neon-blue)))";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)";
                  }}
                >
                  {currentStep + 1 === totalSteps ? "Complete" : "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
