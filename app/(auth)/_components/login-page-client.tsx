"use client";

import { useState } from "react";
import { Loader2, Compass, Shield, Sparkles, Eye, Pi } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/shared/auth/auth-context";
import { siteConfig } from "@/config/site";

export default function LoginPageClient() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-game-dark via-game-accent to-game-highlight">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-neon-purple/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-neon-green/10 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/50 glow-border relative">
            <Compass className="h-10 w-10 text-primary" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold neon-text">
              <Link href={"/"}>{siteConfig.name}</Link>
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover. Resonate. Awaken.
            </p>
            <p className="text-xs text-primary/70 mt-1">
              The Cosmic Lattice Awaits
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="game-card border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="text-center space-y-4 relative z-10">
            <div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                Welcome, Pioneer!
              </CardTitle>
              <CardDescription>
                Connect to the cosmic Lattice through Pi Network and begin your
                harmonic journey
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-primary border-primary/50 w-fit mx-auto"
            >
              <Shield className="w-3 h-3 mr-1" />
              Secure Lattice Authentication
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm group hover:text-primary/80 transition-colors">
                <Shield className="h-4 w-4 text-neon-green group-hover:scale-110 transition-transform" />
                <span className="text-muted-foreground">
                  Secure cosmic Lattice integration
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm group hover:text-primary/80 transition-colors">
                <Sparkles className="h-4 w-4 text-neon-orange group-hover:scale-110 transition-transform" />
                <span className="text-muted-foreground">
                  Earn Pi through harmonic resonance
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm group hover:text-primary/80 transition-colors">
                <Eye className="h-4 w-4 text-neon-purple group-hover:scale-110 transition-transform" />
                <span className="text-muted-foreground">
                  Discover Echo Guardians and Lore Fragments
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm group hover:text-primary/80 transition-colors">
                <Compass className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-muted-foreground">
                  Explore the infinite cosmic frequency
                </span>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full game-button h-12 text-lg font-semibold relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Establishing Lattice Connection...
                </>
              ) : (
                <>
                  <Pi className="mr-2 h-5 w-5" />
                  Begin Harmonic Resonance
                </>
              )}
            </Button>

            {/* Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                By beginning your journey, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Cosmic Accords
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Lattice Privacy
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Requires Pi Browser or Pi Network mobile app for Lattice access
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to the cosmic frequency?{" "}
            <a
              href="https://minepi.com/gshawn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Join the Pi Network
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
