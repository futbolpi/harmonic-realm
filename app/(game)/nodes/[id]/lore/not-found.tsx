import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mb-6">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold mb-2">Node Not Found</h1>
            <p className="text-muted-foreground">
              The harmonic frequency you&apos;re seeking doesn&apos;t exist in
              this realm.
            </p>
          </div>

          <Button asChild className="game-button">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Resonance Hub
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
