-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'BRUTAL');

-- CreateEnum
CREATE TYPE "ChallengeGoalType" AS ENUM ('TOTAL_SHAREPOINTS', 'UNIQUE_NODES_MINED', 'PERFECT_TUNES', 'TERRITORY_CAPTURED', 'VAULT_CONTRIBUTIONS', 'MEMBER_STREAKS');

-- CreateEnum
CREATE TYPE "ChallengeFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL');

-- CreateTable
CREATE TABLE "guild_challenges" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rewardResonance" DOUBLE PRECISION NOT NULL,
    "rewardPrestige" INTEGER NOT NULL,

    CONSTRAINT "guild_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "ChallengeDifficulty" NOT NULL,
    "goalType" "ChallengeGoalType" NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "minMembers" INTEGER NOT NULL DEFAULT 5,
    "minVaultLevel" INTEGER NOT NULL DEFAULT 1,
    "resonanceReward" DOUBLE PRECISION NOT NULL,
    "prestigeReward" INTEGER NOT NULL,
    "frequency" "ChallengeFrequency" NOT NULL,
    "loreText" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_progress" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "challengeId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "contributions" JSONB,

    CONSTRAINT "challenge_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActiveChallenges" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActiveChallenges_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "guild_challenges_startDate_endDate_idx" ON "guild_challenges"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_templates_name_key" ON "challenge_templates"("name");

-- CreateIndex
CREATE INDEX "challenge_templates_difficulty_frequency_idx" ON "challenge_templates"("difficulty", "frequency");

-- CreateIndex
CREATE INDEX "challenge_progress_guildId_completed_idx" ON "challenge_progress"("guildId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_progress_challengeId_guildId_key" ON "challenge_progress"("challengeId", "guildId");

-- CreateIndex
CREATE INDEX "_ActiveChallenges_B_index" ON "_ActiveChallenges"("B");

-- AddForeignKey
ALTER TABLE "guild_challenges" ADD CONSTRAINT "guild_challenges_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "challenge_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_progress" ADD CONSTRAINT "challenge_progress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "guild_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_progress" ADD CONSTRAINT "challenge_progress_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiveChallenges" ADD CONSTRAINT "_ActiveChallenges_A_fkey" FOREIGN KEY ("A") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActiveChallenges" ADD CONSTRAINT "_ActiveChallenges_B_fkey" FOREIGN KEY ("B") REFERENCES "guild_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
