import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { getRecentTransactions } from "../services";

type RecentTransactionsProps = {
  guildId: string;
};

const RecentTransactions = async ({ guildId }: RecentTransactionsProps) => {
  const vaultTransactions = await getRecentTransactions(guildId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📜 Recent Transactions (Last 20)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {vaultTransactions.map((t) => (
            <div key={t.id} className="">
              <div className="text-xs text-muted-foreground">
                {t.createdAt.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <div className="capitalize">{t.reason ?? t.type}</div>
                <div className="text-xs text-muted-foreground">
                  {t.balanceBefore} → {t.balanceAfter}
                </div>
              </div>
            </div>
          ))}
          {vaultTransactions.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
