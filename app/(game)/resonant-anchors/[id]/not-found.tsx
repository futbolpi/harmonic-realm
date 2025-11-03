import Link from "next/link";
import { AlertTriangle, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResonantAnchorNotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="border-destructive/20 bg-destructive/5 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Resonance Lost</CardTitle>
            <CardDescription>
              The anchor resonance you&apos;re seeking has dissipated from the
              lattice.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                This resonant anchor either never existed or has been removed
                from the harmonic realm. The node may have failed to anchor or
                the transaction was canceled.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="outline" asChild>
                <Link href="/resonant-anchors">
                  <Zap className="h-4 w-4 mr-2" />
                  Back to Anchoring
                </Link>
              </Button>
              <Button asChild>
                <Link href="/lattice-calibration">Return to Calibration</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
