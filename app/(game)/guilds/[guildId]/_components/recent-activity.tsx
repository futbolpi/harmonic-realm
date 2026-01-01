import Link from "next/link";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

type RecentActivityProps = { guildId: string; piTransactionId: string | null };

const RecentActivity = async ({
  guildId,
  piTransactionId,
}: RecentActivityProps) => {
  const recentActivity = await prisma.vaultTransaction.findMany({
    where: { guildMember: { guildId }, archivedAt: null },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, reason: true, type: true },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity (Last 24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {recentActivity.map((a) => (
            <li key={a.id} className="text-sm">
              • {a.reason || a.type}
            </li>
          ))}
        </ul>
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
