import prisma from "@/lib/prisma";
import { truncateText } from "@/lib/utils";
import { LeaderboardTable } from "./leaderboard-table";

async function getLeaderboardData() {
  const data = await prisma.user.findMany({
    orderBy: { noOfReferrals: "desc" },
    take: 50,
    select: { username: true, noOfReferrals: true },
  });
  return data.map((user, i) => ({
    position: i + 1,
    username: truncateText(user.username, 15),
    noOfReferrals: user.noOfReferrals,
  }));
}

export default async function ReferralLeaderboard() {
  const data = await getLeaderboardData();
  return <LeaderboardTable data={data} />;
}
