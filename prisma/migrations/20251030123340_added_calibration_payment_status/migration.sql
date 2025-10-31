-- AlterTable
ALTER TABLE "public"."awakening_contributions" ADD COLUMN     "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';
