import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

type Props = {
  chamber: {
    lastMaintenanceAt: string;
    createdAt: string;
    maintenanceDueAt: string;
  };
};

const TimelineCard = ({ chamber }: Props) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created</span>
          <span>
            {formatDistanceToNow(new Date(chamber.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Maintained</span>
          <span>
            {formatDistanceToNow(new Date(chamber.lastMaintenanceAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Next Maintenance</span>
          <span>
            {formatDistanceToNow(new Date(chamber.maintenanceDueAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineCard;
