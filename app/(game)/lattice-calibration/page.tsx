import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import VideoModal from "@/components/shared/video-modal";
import { videoLinks } from "@/config/site";
import { PhaseOverview } from "./_components/phase-overview";
import { ContributionsTable } from "./_components/contributions-table";
import { StakingForm } from "./_components/staking-form";
import { CalibrationHelpModal } from "./_components/calibration-help-modal";

/**
 * Lattice Calibration Page
 * Shows phase information, contributions, and allows users to stake Pi
 */
export default async function CalibrationPage() {
  // Fetch current active phase
  const phase = await prisma.gamePhase.findFirst({
    orderBy: { phaseNumber: "desc" },
    where: { endTime: null },
    include: {
      contributions: {
        orderBy: { createdAt: "desc" },
        where: { paymentStatus: "COMPLETED" },
      },
    },
  });

  if (!phase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No active phase found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Lattice Calibration{" "}
            <span className="gap-2">
              <CalibrationHelpModal />
              <VideoModal
                src={videoLinks.calibrationHelper.url}
                title={videoLinks.calibrationHelper.title}
              />
            </span>
          </h1>
          <p className="text-muted-foreground">
            Contribute Pi to shape the harmonic lattice and earn rewards
          </p>
        </div>

        {/* Tabs Layout */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Phase Info</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="stake">Stake Pi</TabsTrigger>
          </TabsList>

          {/* Phase Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <PhaseOverview phase={phase} />
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions" className="space-y-6">
            <ContributionsTable
              contributions={phase.contributions.map((ct) => ({
                contributionTier: ct.contributionTier,
                createdAt: ct.createdAt,
                paymentStatus: ct.paymentStatus,
                piContributed: ct.piContributed.toNumber(),
              }))}
            />
          </TabsContent>

          {/* Staking Tab */}
          <TabsContent value="stake" className="space-y-6">
            <StakingForm
              phase={{
                requiredPiFunding: phase.requiredPiFunding.toFixed(2),
                currentProgress: phase.currentProgress.toString(),
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
