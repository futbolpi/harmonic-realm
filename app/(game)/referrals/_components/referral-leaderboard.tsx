import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { truncateText } from "@/lib/utils";

export default async function ReferralLeaderboard() {
  const leaderboardData = await prisma.user.findMany({
    orderBy: { noOfReferrals: "desc" },
    take: 10,
    select: { username: true, noOfReferrals: true },
  });

  return (
    <Card className="mt-8 mb-16">
      <CardHeader>
        <CardTitle>Referral Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Position</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((user, index) => (
                <TableRow key={user.username}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{truncateText(user.username, 15)}</TableCell>
                  <TableCell className="text-right">
                    {user.noOfReferrals}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
