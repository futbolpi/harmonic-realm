"use client";

import { ChevronLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StatusInfo } from "@/lib/schema/drift";

interface HeaderProps {
  statusInfo: StatusInfo;
  setShowInfoModal: Dispatch<SetStateAction<boolean>>;
}

const Header = ({ statusInfo, setShowInfoModal }: HeaderProps) => {
  const router = useRouter();

  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/map")}
        className="text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-lg font-bold text-white">Resonant Drift</h1>
        <Badge variant={statusInfo.variant}>
          {statusInfo.icon} {statusInfo.text}
        </Badge>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowInfoModal(true)}
        className="text-white hover:bg-white/20 relative z-30 bg-black/20 p-2 rounded-full"
        aria-label="Resonant drift help"
      >
        <Info className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Header;
