"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, Sparkles, Share2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface GenesisCountdownProps {
  currentHarmonizers: number
  requiredHarmonizers: number
}

export function GenesisCountdown({ currentHarmonizers, requiredHarmonizers }: GenesisCountdownProps) {
  const [mounted, setMounted] = useState(false)
  const progress = (currentHarmonizers / requiredHarmonizers) * 100

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-8 bg-gradient-to-b from-background via-background to-muted overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary left-1/2 top-1/2"
            style={{
              boxShadow: "0 0 10px hsl(var(--primary))",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="relative max-w-3xl w-full flex flex-col items-center gap-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Pulsing icon */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div
            className="absolute inset-[-2rem] opacity-60"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)",
            }}
          />
          <Sparkles
            className="w-20 h-20 text-primary z-10"
            style={{ filter: "drop-shadow(0 0 20px hsl(var(--primary)))" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-primary via-chart-3 to-chart-5 bg-clip-text text-transparent leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          The First Harmonic Awakening Approaches
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg text-center text-muted-foreground leading-relaxed max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The cosmic Lattice lies dormant, awaiting the convergence of Pioneers to ignite the genesis phase. When enough
          Harmonizers unite, the first Echo Guardian Nodes will materialize across the realm.
        </motion.p>

        {/* Progress section */}
        <motion.div
          className="w-full flex flex-col gap-6 p-8 bg-card/50 backdrop-blur-sm border border-border rounded-lg"
          style={{
            boxShadow: "0 0 20px hsl(var(--primary) / 0.1)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex flex-col sm:flex-row justify-around items-center gap-8">
            <div className="flex items-center gap-4">
              <Users
                className="w-10 h-10 text-chart-2"
                style={{ filter: "drop-shadow(0 0 10px hsl(var(--chart-2)))" }}
              />
              <div>
                <div className="text-3xl font-bold text-foreground">{currentHarmonizers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Current Harmonizers</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="sm:hidden w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex items-center gap-4">
              <Zap className="w-10 h-10 text-chart-2" style={{ filter: "drop-shadow(0 0 10px hsl(var(--chart-2)))" }} />
              <div>
                <div className="text-3xl font-bold text-foreground">{requiredHarmonizers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Required for Genesis</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative w-full">
            <Progress value={progress} className="h-4 bg-muted/30" />
            <motion.div
              className="absolute inset-[-0.5rem] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, hsl(var(--primary) / 0.2), transparent 70%)",
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground font-medium">
            {progress.toFixed(1)}% Complete • {(requiredHarmonizers - currentHarmonizers).toLocaleString()} Harmonizers
            Needed
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          className="flex flex-col items-center gap-4 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-center text-foreground">
            Accelerate the awakening by inviting fellow Pioneers to join the cosmic journey
          </p>
          <Button
            onClick={() => {
              // Handle invite action - could open share dialog, copy referral link, etc.
              console.log("[v0] Invite button clicked")
            }}
            size="lg"
            className="bg-gradient-to-r from-primary to-chart-3 hover:from-primary/90 hover:to-chart-3/90 text-primary-foreground font-semibold border-none transition-all"
            style={{
              boxShadow: "0 0 30px hsl(var(--primary) / 0.4)",
            }}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Invite Harmonizers
          </Button>
        </motion.div>

        {/* Lore footer */}
        <motion.div
          className="flex flex-col gap-4 w-full mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <p className="text-sm italic text-muted-foreground text-center leading-relaxed">
            &quot;In the silence before creation, the Lattice dreams of resonance. Each Pioneer who answers the call brings
            us closer to the moment when cosmic frequencies align and the first Nodes emerge from the mathematical
            void.&quot;
          </p>
          <div className="text-xs text-muted-foreground text-center opacity-70">— The Echo Codex, Fragment Zero</div>
        </motion.div>
      </motion.div>
    </div>
  )
}
