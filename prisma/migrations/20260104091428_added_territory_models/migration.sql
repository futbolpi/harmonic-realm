-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "territoryHexId" TEXT;

-- CreateTable
CREATE TABLE "Territory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hexId" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLon" DOUBLE PRECISION NOT NULL,
    "resolution" INTEGER NOT NULL DEFAULT 8,
    "guildId" TEXT,
    "controlledAt" TIMESTAMP(3),
    "controlEndsAt" TIMESTAMP(3),
    "currentStake" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activeChallengeId" TEXT,
    "trafficScore" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryChallenge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "territoryId" TEXT NOT NULL,
    "defenderId" TEXT NOT NULL,
    "defenderStake" DOUBLE PRECISION NOT NULL,
    "defenderScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attackerId" TEXT NOT NULL,
    "attackerStake" DOUBLE PRECISION NOT NULL,
    "attackerScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "winnerId" TEXT,

    CONSTRAINT "TerritoryChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryContribution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challengeId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "sharePoints" DOUBLE PRECISION NOT NULL,
    "tuneCount" INTEGER NOT NULL,

    CONSTRAINT "TerritoryContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Territory_hexId_key" ON "Territory"("hexId");

-- CreateIndex
CREATE UNIQUE INDEX "Territory_activeChallengeId_key" ON "Territory"("activeChallengeId");

-- CreateIndex
CREATE INDEX "Territory_guildId_idx" ON "Territory"("guildId");

-- CreateIndex
CREATE INDEX "Territory_hexId_idx" ON "Territory"("hexId");

-- CreateIndex
CREATE INDEX "TerritoryChallenge_territoryId_resolved_idx" ON "TerritoryChallenge"("territoryId", "resolved");

-- CreateIndex
CREATE INDEX "TerritoryChallenge_endsAt_idx" ON "TerritoryChallenge"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryContribution_challengeId_username_key" ON "TerritoryContribution"("challengeId", "username");

-- CreateIndex
CREATE INDEX "nodes_territoryHexId_idx" ON "nodes"("territoryHexId");

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_territoryHexId_fkey" FOREIGN KEY ("territoryHexId") REFERENCES "Territory"("hexId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_activeChallengeId_fkey" FOREIGN KEY ("activeChallengeId") REFERENCES "TerritoryChallenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryChallenge" ADD CONSTRAINT "TerritoryChallenge_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryChallenge" ADD CONSTRAINT "TerritoryChallenge_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryChallenge" ADD CONSTRAINT "TerritoryChallenge_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryContribution" ADD CONSTRAINT "TerritoryContribution_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "TerritoryChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryContribution" ADD CONSTRAINT "TerritoryContribution_username_fkey" FOREIGN KEY ("username") REFERENCES "GuildMember"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
