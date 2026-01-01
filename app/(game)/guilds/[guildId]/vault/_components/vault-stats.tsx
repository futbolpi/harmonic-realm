import { endOfWeek, formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type VaultStatsProps = { totalContributed: number; weekDeposit: number | null };

const VaultStats = ({ totalContributed, weekDeposit }: VaultStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vault Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Total Deposited</span>
            <strong>{totalContributed.toLocaleString()} SP</strong>
          </div>
          <div className="flex justify-between">
            <span>This Week Deposits</span>
            <strong>{(weekDeposit || 0).toLocaleString()} SP</strong>
          </div>
          <div className="flex justify-between">
            <span>Weekly Pool</span>
            <strong>
              {(weekDeposit ? weekDeposit * 0.2 : 0).toLocaleString()} SP
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Next Distribution</span>
            <strong>
              {formatDistanceToNow(endOfWeek(new Date(), { weekStartsOn: 1 }))}
            </strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VaultStats;
