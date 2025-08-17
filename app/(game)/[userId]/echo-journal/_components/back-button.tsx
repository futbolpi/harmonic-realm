"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
};

export default BackButton;
