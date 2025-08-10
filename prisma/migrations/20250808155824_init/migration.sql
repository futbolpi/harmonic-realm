-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "piUid" TEXT NOT NULL,
    "piUsername" TEXT NOT NULL,
    "piAccessToken" TEXT,
    "sharePoints" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_piUid_key" ON "public"."users"("piUid");

-- CreateIndex
CREATE UNIQUE INDEX "users_piUsername_key" ON "public"."users"("piUsername");
