import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContributionNotFound() {
  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
      <Card className="border-destructive/20 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-destructive">
            Contribution Not Found
          </CardTitle>
          <CardDescription>
            The awakening contribution you&apos;re looking for doesn&apos;t
            exist or has been removed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This could happen if the contribution ID is invalid or if the
            contribution was removed from the lattice.
          </p>

          <Link href="/lattice-calibration" className="block">
            <Button className="w-full" variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calibration
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
