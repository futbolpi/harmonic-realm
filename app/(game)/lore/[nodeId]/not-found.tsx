import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[--background] text-[--foreground]">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Unknown Echo Node</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[--muted-foreground] italic">
              This Echo Node has not yet resonated in the Lattice. Its cosmic
              signature remains uncharted.
            </p>
            <div className="mt-6 flex gap-4">
              <Button asChild>
                <Link href="/map">Explore Other Nodes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Return to Resonance Hub</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
