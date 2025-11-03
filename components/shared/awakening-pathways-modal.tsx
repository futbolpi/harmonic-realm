"use client";
import Link from "next/link";
import { ZapIcon, TrendingUpIcon, Users2Icon, MapPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
} from "@/components/credenza";

interface AwakeningPathwaysModalProps {
  trigger?: React.ReactNode;
}

export function AwakeningPathwaysModal({
  trigger,
}: AwakeningPathwaysModalProps) {
  const defaultTrigger = (
    <Button size="sm" className="game-button cursor-pointer shadow-lg">
      <MapPlus className="h-4 w-4" />
    </Button>
  );

  return (
    <Credenza>
      <CredenzaTrigger asChild>{trigger || defaultTrigger}</CredenzaTrigger>

      <CredenzaContent className="max-w-2xl p-0 gap-0">
        <CredenzaBody className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
          <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-b px-6 py-8 text-center">
            <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground opacity-50">
              π resonance detected
            </div>
            <CredenzaTitle className="text-2xl mb-2 text-balance">
              Two Paths to Harmony
            </CredenzaTitle>
            <CredenzaDescription className="text-base text-pretty">
              Choose how you&apos;ll reshape the Lattice and earn eternal
              recognition
            </CredenzaDescription>
          </div>

          <div className="px-6 py-8 space-y-4">
            {/* Calibration Pathway */}
            <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="rounded-lg bg-primary/10 p-2 h-fit">
                      <Users2Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Lattice Calibration
                      </CardTitle>
                      <CardDescription>Unite with the realm</CardDescription>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-primary whitespace-nowrap">
                    Community Event
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                <p className="text-sm text-muted-foreground">
                  Pool your Pi with fellow Pioneers to synchronize rare Nodes
                  across high-activity zones worldwide.
                </p>

                <Link href="/lattice-calibration" className="block pt-2">
                  <Button className="w-full" variant="default" size="sm">
                    Contribute to Calibration
                    <TrendingUpIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Anchoring Pathway */}
            <Card className="border-2 border-secondary/20 hover:border-secondary/50 transition-colors cursor-pointer group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="rounded-lg bg-secondary/10 p-2 h-fit">
                      <ZapIcon className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Resonant Anchoring
                      </CardTitle>
                      <CardDescription>Claim your sacred site</CardDescription>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-secondary whitespace-nowrap">
                    Solo Power
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                <p className="text-sm text-muted-foreground">
                  Stake Pi at your chosen location to permanently anchor a Node.
                  Watch others discover your creation.
                </p>

                <Link href="/resonant-anchors" className="block pt-2">
                  <Button className="w-full" variant="secondary" size="sm">
                    Anchor Your Node
                    <ZapIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="border-t bg-muted/30 px-6 py-4 text-center text-xs text-muted-foreground space-y-1">
            <div className="font-mono text-[10px] opacity-50">
              Both paths feed the Lattice. Neither is &quot;better&quot;—only{" "}
              <em>when</em> you act matters.
            </div>
            <div className="text-[11px]">
              Calibration for community impact. Anchoring for personal power.{" "}
              <strong>Choose wisely.</strong>
            </div>
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
