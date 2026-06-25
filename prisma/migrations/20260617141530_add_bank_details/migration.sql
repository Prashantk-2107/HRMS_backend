-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('savings', 'current');

-- CreateTable
CREATE TABLE "employee_bank_details" (
    "emp_bank_id" UUID NOT NULL,
    "emp_id" UUID NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ifsc_code" TEXT NOT NULL,
    "branch_address" TEXT NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_bank_details_pkey" PRIMARY KEY ("emp_bank_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_bank_details_emp_id_account_number_key" ON "employee_bank_details"("emp_id", "account_number");

-- AddForeignKey
ALTER TABLE "employee_bank_details" ADD CONSTRAINT "employee_bank_details_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("emp_id") ON DELETE CASCADE ON UPDATE CASCADE;
