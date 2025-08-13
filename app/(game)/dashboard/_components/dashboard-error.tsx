"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/queries/use-profile";

const DashboardError = () => {
  const { error, refreshProfile } = useProfile();

  if (!error) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Alert className="max-w-md mx-auto border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          Failed to load profile: {error.message}
          <Button
            onClick={refreshProfile}
            size="sm"
            variant="outline"
            className="ml-2 bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DashboardError;
