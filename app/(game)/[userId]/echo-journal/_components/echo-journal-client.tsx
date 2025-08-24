import { BookOpen, Clock, Map, Zap } from "lucide-react";
import { Suspense } from "react";

import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/lib/schema/user";
import { MiningSessionsTable } from "@/app/(game)/_components/mining-sessions-table";
import { UserStatsPanel } from "./user-stats-panel";
import { MiningPathMap } from "./mining-path-map";
import BackButton from "./back-button";
import EchoJournalTabs from "./echo-journal-tabs";
import { ComingSoon } from "./coming-soon";
import { UserMasteriesLoading } from "./user-masteries-loading";
import { UserMasteries } from "./user-masteries";

interface EchoJournalClientProps {
  userProfile: UserProfile;
}

export function EchoJournalClient({ userProfile }: EchoJournalClientProps) {
  const sessions = userProfile.sessions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-game-accent" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-game-accent to-game-secondary bg-clip-text text-transparent">
                  Echo Journal
                </h1>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Pioneer: {userProfile.username}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="container mx-auto px-4 py-6">
        <UserStatsPanel user={userProfile} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <EchoJournalTabs>
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Journey Map</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="mastery" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Mastery</span>
            </TabsTrigger>
            <TabsTrigger value="lore" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Lore</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-0">
            <MiningPathMap sessions={sessions} />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-game-accent" />
                Mining Sessions
              </h2>
              <MiningSessionsTable sessions={sessions} />
            </div>
          </TabsContent>

          <TabsContent value="mastery" className="space-y-4">
            <Suspense fallback={<UserMasteriesLoading />}>
              <UserMasteries userId={userProfile.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="lore" className="space-y-4">
            <ComingSoon feature="lore-fragments" />
          </TabsContent>
        </EchoJournalTabs>
      </div>
    </div>
  );
}
