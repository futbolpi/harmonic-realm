import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserReferrals from "./_components/user-referrals";
import ReferralLeaderboard from "./_components/referral-leaderboard";

export const revalidate = 18000;

export default function ReferralsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Referrals Dashboard</h1>
      <Tabs defaultValue="user-info" className="w-full">
        <TabsList>
          <TabsTrigger value="user-info">Your Referrals</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="user-info">
          <UserReferrals />
        </TabsContent>
        <TabsContent value="leaderboard">
          <ReferralLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
