import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import MembersClient from "./_components/members-client";
import InviteModal from "./_components/invite-modal";

type Props = { params: Promise<{ guildId: string }> };

export default async function MembersPage({ params }: Props) {
  const { guildId } = await params;

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: {
      id: true,
      members: { where: { isActive: true } },
      maxMembers: true,
      leaderUsername: true,
      piTransactionId: true,
    },
  });

  if (!guild) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">👥 Members</h1>
          <div className="text-sm text-muted-foreground">
            <span className="mr-2">
              {guild.members.length}/{guild.maxMembers}
            </span>
            {guild.piTransactionId && (
              <InviteModal
                guildId={guild.id}
                maxMembers={guild.maxMembers}
                noOfMembers={guild.members.length}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MembersClient guild={guild} />
          </div>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Active Members</span>
                    <strong>
                      {
                        guild.members.filter(
                          (m) => (m.weeklySharePoints ?? 0) > 0
                        ).length
                      }
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive</span>
                    <strong>
                      {
                        guild.members.filter(
                          (m) => (m.weeklySharePoints ?? 0) === 0
                        ).length
                      }
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
