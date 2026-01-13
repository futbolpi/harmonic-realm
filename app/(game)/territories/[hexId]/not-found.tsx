import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TerritoryNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="p-8 space-y-6 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Territory Not Found
              </h1>
              <p className="text-sm text-muted-foreground">
                This territory has not been claimed yet, or the hex ID is
                invalid. Return to the map to find territories to stake.
              </p>
            </div>

            {/* Message */}
            <div className="bg-muted/50 border border-border/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono">
                Territories are created when guilds stake RESONANCE. Only
                claimed territories have detail pages.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/territories" className="w-full">
                <Button className="w-full">Explore Territories Map</Button>
              </Link>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
