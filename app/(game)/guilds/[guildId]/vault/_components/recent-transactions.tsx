import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { getRecentTransactions } from "../services";
import VaultTransactionsTable from "./vault-transactions-table";

type RecentTransactionsProps = {
  guildId: string;
};

const RecentTransactions = async ({ guildId }: RecentTransactionsProps) => {
  const vaultTransactions = await getRecentTransactions(guildId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📜 Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <VaultTransactionsTable transactions={vaultTransactions} />
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
