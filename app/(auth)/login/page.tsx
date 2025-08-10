"use client";

import { useState } from "react";
import { Loader2, Zap, Shield, Coins } from "lucide-react";
import Image from "next/image";
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

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-game-dark via-game-accent to-game-highlight">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/50 glow-border">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold neon-text">Pi Mining Nodes</h1>
            <p className="text-muted-foreground">Explore. Mine. Earn.</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="game-card border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div>
              <CardTitle className="text-2xl">Welcome Pioneer!</CardTitle>
              <CardDescription>
                Connect your Pi Network account to start mining
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-primary border-primary/50 w-fit mx-auto"
            >
              Secure Pi SDK Authentication
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-neon-green" />
                <span className="text-muted-foreground">
                  Secure Pi Network integration
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Coins className="h-4 w-4 text-neon-orange" />
                <span className="text-muted-foreground">
                  Earn real Pi through gameplay
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Location-based mining adventure
                </span>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full game-button h-12 text-lg font-semibold cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting to Pi Network...
                </>
              ) : (
                <>
                  <Image
                    src="/placeholder.svg?height=20&width=20&text=π"
                    alt="Pi"
                    className="mr-2 h-5 w-5"
                    width={20}
                    height={20}
                  />
                  Login with Pi Network
                </>
              )}
            </Button>

            {/* Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                By logging in, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Requires Pi Browser or Pi Network mobile app
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to Pi Network?{" "}
            <a
              href="https://minepi.com"
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
