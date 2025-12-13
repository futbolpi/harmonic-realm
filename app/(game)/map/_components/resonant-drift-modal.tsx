"use client";
import { Magnet } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
  CredenzaHeader,
  CredenzaFooter,
} from "@/components/credenza";

interface ResonantDriftModalProps {
  trigger?: React.ReactNode;
}

export function ResonantDriftModal({ trigger }: ResonantDriftModalProps) {
  const router = useRouter();

  const defaultTrigger = (
    <Button size="sm" className="game-button cursor-pointer shadow-lg">
      <Magnet className="h-4 w-4" />
    </Button>
  );

  return (
    <Credenza>
      <CredenzaTrigger asChild>{trigger || defaultTrigger}</CredenzaTrigger>
      <CredenzaContent className="max-w-2xl p-0 gap-0">
        <CredenzaHeader>
          <CredenzaTitle className="text-2xl mb-2 text-balance">
            Resonant Drift
          </CredenzaTitle>
          <CredenzaDescription className="text-base text-pretty">
            Summon dormant Nodes to your vicinity when isolated (no Nodes within
            10km).
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-b px-6 py-8 text-center">
            <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground opacity-50">
              Scan for distant signals to pull closer.
            </div>
            Beckon inactive distant Nodes closer if none are within 10km,
            reviving the Lattice in underserved areas.
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <Button onClick={() => router.push("/resonant-drift")}>
            Summon Node
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
