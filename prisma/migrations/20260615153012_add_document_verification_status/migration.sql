-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- AlterTable
ALTER TABLE "employees_documents" ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" UUID;

-- AddForeignKey
ALTER TABLE "employees_documents" ADD CONSTRAINT "employees_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "employees"("emp_id") ON DELETE SET NULL ON UPDATE CASCADE;
