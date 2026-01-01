"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GuildPaymentButton } from "./guild-payment-button";

type Props = {
  guild: {
    paymentId: string | null;
    piTransactionId: string | null;
    leaderUsername: string;
    id: string;
  };
  isLeader: boolean;
};

const PaymentsCard = ({ guild, isLeader }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Creation Fee</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guild.paymentId ? (
            <div className="rounded-md border p-4 bg-green-50">
              <p className="font-semibold">Payment Completed</p>
              <p className="text-sm text-muted-foreground">
                Transaction ID: {guild.piTransactionId}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                A guild must pay a creation fee before it can invite members or
                participate in territory activities.
              </p>
              {isLeader ? (
                <GuildPaymentButton
                  guildId={guild.id}
                  leaderUsername={guild.leaderUsername}
                />
              ) : (
                <p className="text-sm">
                  Only the guild leader can pay the creation fee.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentsCard;
