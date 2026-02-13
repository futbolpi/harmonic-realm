-- ============================================================================
-- RESONANCE DRIFT V2.0 DATABASE MIGRATION
-- ============================================================================
-- This migration adds support for the v2.0 drift system enhancements:
-- - lastDriftNodeId tracking for personal lock system
-- - gracePeriodEndsAt for 7-day grace period before node becomes re-driftable
-- - personalLockEndsAt for 72-hour protection against sniping
-- ============================================================================ 

-- AlterTable: Add new tracking fields to User model
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "lastDriftNodeId" TEXT;

-- AlterTable: Add new timestamp fields to NodeDrift model  
ALTER TABLE "public"."node_drifts"
ADD COLUMN IF NOT EXISTS "gracePeriodEndsAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "personalLockEndsAt" TIMESTAMP(3);

-- Backfill existing drift records with calculated timestamps
-- gracePeriodEndsAt = timestamp + 7 days
-- personalLockEndsAt = timestamp + 72 hours
UPDATE "public"."node_drifts"
SET 
  "gracePeriodEndsAt" = "timestamp" + INTERVAL '7 days',
  "personalLockEndsAt" = "timestamp" + INTERVAL '72 hours'
WHERE "gracePeriodEndsAt" IS NULL;

-- Create index for efficient grace period queries
CREATE INDEX IF NOT EXISTS "node_drifts_gracePeriodEndsAt_idx" 
ON "public"."node_drifts"("gracePeriodEndsAt");

-- Create index for personal lock queries
CREATE INDEX IF NOT EXISTS "node_drifts_personalLockEndsAt_idx"
ON "public"."node_drifts"("personalLockEndsAt");

-- Create composite index for node eligibility checks
CREATE INDEX IF NOT EXISTS "node_drifts_nodeId_gracePeriod_idx"
ON "public"."node_drifts"("nodeId", "gracePeriodEndsAt");

-- Add foreign key constraint for lastDriftNodeId
ALTER TABLE "public"."users"
ADD CONSTRAINT "users_lastDriftNodeId_fkey" 
FOREIGN KEY ("lastDriftNodeId") 
REFERENCES "public"."nodes"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
