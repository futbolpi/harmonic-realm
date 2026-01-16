import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ChallengesNotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
            <AlertCircle className="h-16 w-16 text-destructive relative z-10" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold mb-2">Guild Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The guild you&apos;re seeking has been lost in the cosmic void. It may
          no longer exist or you don&apos;t have access to it.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Link href="/guilds/discover">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Find Another Guild
            </Button>
          </Link>
          <Link href="/map">
            <Button className="gap-2">Return to Map →</Button>
          </Link>
        </div>

        {/* Lore */}
        <p className="text-xs text-muted-foreground mt-8 italic">
          &quot;Every guild harmonizes for a moment, then disperses into the
          Lattice...&quot;
        </p>
      </div>
    </main>
  );
}
