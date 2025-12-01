import prisma from "@/lib/prisma";
import { calculateAnchorCost } from "@/lib/anchors/utils";
import { calculateGlobalAnchorIndex } from "@/lib/api-helpers/server/anchors/utils";
import AnchoringForm from "./_components/anchoring-form";
import { AnchorHelpModal } from "./_components/anchor-help-modal";

export default async function ResonantAnchorsPage() {
  // Fetch current active game phase
  const currentPhase = await prisma.gamePhase.findFirst({
    orderBy: { phaseNumber: "desc" },
    where: { endTime: null },
    select: { id: true, requiredPiFunding: true },
  });

  if (!currentPhase) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto max-w-4xl px-4 py-6 md:py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No Active Phase</h1>
            <p className="text-muted-foreground">
              Waiting for lattice calibration to complete...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const globalAnchorIndex = await calculateGlobalAnchorIndex(currentPhase.id);

  const anchorCost = calculateAnchorCost(
    currentPhase.requiredPiFunding,
    globalAnchorIndex
  );

  return (
    <main className="bg-gradient-to-b from-background to-card/95">
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Resonant Anchoring{" "}
            <span>
              <AnchorHelpModal />
            </span>
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Plant your individual Node and shape the Lattice. Costs rise as
            others anchor nearby—anchor early for the best price.
          </p>
        </div>

        <AnchoringForm anchorCost={anchorCost.toString()} />
      </div>
    </main>
  );
}
