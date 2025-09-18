"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Trophy, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWindowSize } from "@/hooks/use-window-size";

interface MasteryTierPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tier: {
    name: string;
    level: number;
    description: string;
    rewards: string[];
    icon: string;
  };
}

export function MasteryTierPopup({
  isOpen,
  onClose,
  tier,
}: MasteryTierPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          colors={["#3b82f6", "#8b5cf6", "#06d6a0", "#f72585", "#ffbe0b"]}
        />
      )}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          className="fixed z-50 w-full max-w-md mx-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4"
        >
          <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-background via-background/95 to-primary/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-16 translate-x-16 animate-pulse" />

            <CardContent className="relative p-8 text-center space-y-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mx-auto"
                >
                  {tier.icon}
                </motion.div>

                <div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary mb-2"
                  >
                    Mastery Tier Unlocked
                  </Badge>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {tier.name}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Level {tier.level} Achievement
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {tier.description}
              </p>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  New Abilities Unlocked
                </h3>
                <div className="space-y-2">
                  {tier.rewards.map((reward, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Trophy className="h-3 w-3 text-primary flex-shrink-0" />
                      <span>{reward}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Continue Journey
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
