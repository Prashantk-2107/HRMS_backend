-- CreateEnum
CREATE TYPE "RegularizationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "attendance_regularizations" (
    "id" UUID NOT NULL,
    "attendance_id" UUID NOT NULL,
    "emp_id" UUID NOT NULL,
    "requested_date" DATE NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "reason" VARCHAR(255) NOT NULL,
    "status" "RegularizationStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_regularizations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attendance_regularizations" ADD CONSTRAINT "attendance_regularizations_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_regularizations" ADD CONSTRAINT "attendance_regularizations_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("emp_id") ON DELETE CASCADE ON UPDATE CASCADE;
