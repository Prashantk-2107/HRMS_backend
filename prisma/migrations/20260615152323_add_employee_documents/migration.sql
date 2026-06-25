-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('aadhar', 'pan', 'passport', 'driving_license', 'degree', 'experience_letter', 'offer_letter', 'other');

-- CreateTable
CREATE TABLE "employees_documents" (
    "document_id" UUID NOT NULL,
    "emp_id" UUID NOT NULL,
    "document_name" VARCHAR(255),
    "document_type" "DocumentType" NOT NULL,
    "document_number" TEXT,
    "file_url" TEXT NOT NULL,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_documents_pkey" PRIMARY KEY ("document_id")
);

-- AddForeignKey
ALTER TABLE "employees_documents" ADD CONSTRAINT "employees_documents_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("emp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_documents" ADD CONSTRAINT "employees_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "employees"("emp_id") ON DELETE SET NULL ON UPDATE CASCADE;
