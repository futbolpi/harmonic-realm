"use client";

import { Share2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { getPiSDK } from "@/components/shared/pi/pi-sdk";

interface SharingSectionProps {
  loreTitle: string;
}

export default function SharingSection({ loreTitle }: SharingSectionProps) {
  const pathname = usePathname();
  const shareUrl = `${env.NEXT_PUBLIC_PINET_URL}${pathname}`;
  const shareText = `Unveiled cosmic lore at ${loreTitle}! Join the resonance in HarmonicRealm: \n ${shareUrl}`;

  const handleShare = async () => {
    const piSdk = getPiSDK();

    piSdk.openShareDialog(loreTitle, shareText);
    // Toast: Link copied
  };

  return (
    <div className="mt-8 flex justify-center gap-4">
      <Button onClick={handleShare}>
        <Share2 className="mr-2" /> Broadcast Echo
      </Button>
      {/* Add more buttons for X, Discord, etc. */}
    </div>
  );
}
