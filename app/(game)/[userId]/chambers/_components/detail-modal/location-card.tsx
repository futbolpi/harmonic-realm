import { MapPin } from "lucide-react";
import Link from "next/link";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = { chamber: { latitude: number; longitude: number } };

const LocationCard = ({ chamber }: Props) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm font-mono">
          {chamber.latitude.toFixed(6)}, {chamber.longitude.toFixed(6)}
        </div>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link
            href={`/map?lat=${chamber.latitude}&lng=${chamber.longitude}`}
            prefetch={false}
          >
            <MapPin className="mr-2 h-4 w-4" />
            View on Map
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
