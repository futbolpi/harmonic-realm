"use client";

import { ArrowLeft, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const StakeNotFound = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <XCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Stake Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The requested stake details could not be found.
      </p>
      <Button onClick={() => router.push("/map")} className="game-button">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Return to Nodes
      </Button>
    </div>
  );
};

export default StakeNotFound;
