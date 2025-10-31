"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="mb-6"
      onClick={() => router.push("/lattice-calibration")}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Calibration
    </Button>
  );
};

export default BackButton;
