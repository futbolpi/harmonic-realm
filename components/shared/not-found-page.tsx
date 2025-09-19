"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "var(--color-background)",
        color: "var(--color-foreground)",
      }}
    >
      <div className="text-center max-w-2xl mx-auto">
        {/* Cosmic Error Animation */}
        <div className="mb-8 relative">
          <div
            className="text-8xl font-bold mb-4"
            style={{
              background:
                "linear-gradient(45deg, var(--color-neon-blue), var(--color-neon-purple), var(--color-neon-green))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              animation: "var(--animate-pulse-neon)",
            }}
          >
            404
          </div>
          <div
            className="absolute inset-0 text-8xl font-bold opacity-20"
            style={{
              background:
                "linear-gradient(45deg, var(--color-neon-pink), var(--color-neon-orange))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              animation: "var(--animate-glow)",
            }}
          >
            404
          </div>
        </div>

        {/* Lore-aligned Error Message */}
        <div
          className="p-6 rounded-lg mb-8 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(to bottom right, color-mix(in srgb, var(--color-game-accent) 50%, transparent), color-mix(in srgb, var(--color-game-highlight) 30%, transparent))",
            border:
              "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <h1
            className="text-3xl font-bold mb-4"
            style={{
              background:
                "linear-gradient(to right, var(--color-neon-blue), var(--color-neon-purple))",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Resonance Signal Lost
          </h1>
          <p
            className="text-lg mb-4"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            The cosmic coordinates you&apos;ve entered don&apos;t exist in the
            HarmonicRealm. This dimensional pathway has been severed from the Pi
            Network.
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Your Pioneer consciousness has drifted into uncharted space. Return
            to the Resonance Hub to realign with the network&apos;s harmonic
            frequencies.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <Button
              className="px-8 py-3 font-semibold transition-all duration-300"
              style={{
                background:
                  "linear-gradient(to right, color-mix(in srgb, var(--color-primary) 80%, transparent), var(--color-primary))",
                boxShadow:
                  "0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)",
                borderRadius: "var(--radius-lg)",
                color: "var(--color-primary-foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 80%, transparent))";
                e.currentTarget.style.boxShadow =
                  "0 0 30px color-mix(in srgb, var(--color-primary) 50%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, color-mix(in srgb, var(--color-primary) 80%, transparent), var(--color-primary))";
                e.currentTarget.style.boxShadow =
                  "0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent)";
              }}
            >
              Return to Resonance Hub
            </Button>
          </Link>

          <Link href="/map">
            <Button
              variant="outline"
              className="px-8 py-3 font-semibold transition-all duration-300 bg-transparent"
              style={{
                background: "transparent",
                border:
                  "1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)",
                color: "var(--color-foreground)",
                borderRadius: "var(--radius-lg)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "color-mix(in srgb, var(--color-primary) 10%, transparent)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px color-mix(in srgb, var(--color-primary) 20%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Explore Cosmic Map
            </Button>
          </Link>
        </div>

        {/* Cosmic Decoration */}
        <div className="mt-12 flex justify-center space-x-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  i % 2 === 0
                    ? "var(--color-neon-blue)"
                    : "var(--color-neon-purple)",
                animation: `var(--animate-pulse-neon) ${
                  1.5 + i * 0.2
                }s infinite`,
                boxShadow: `0 0 10px ${
                  i % 2 === 0
                    ? "var(--color-neon-blue)"
                    : "var(--color-neon-purple)"
                }`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
