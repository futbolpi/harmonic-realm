import Link from "next/link";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import VaultTransactionsTable from "../vault/_components/vault-transactions-table";

type RecentActivityProps = { guildId: string; piTransactionId: string | null };

const RecentActivity = async ({
  guildId,
  piTransactionId,
}: RecentActivityProps) => {
  const recentActivity = await prisma.vaultTransaction.findMany({
    where: { guildMember: { guildId }, archivedAt: null },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reason: true,
      type: true,
      balanceAfter: true,
      balanceBefore: true,
      createdAt: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity (Last 24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <VaultTransactionsTable transactions={recentActivity} />

        {piTransactionId && (
          <div className="mt-3">
            <Link
              href={`/guilds/${guildId}/vault`}
              className="text-sm text-primary"
            >
              View Full Activity Log →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
