-- CreateTable
CREATE TABLE "extra_permissions" (
    "extrapermission_id" UUID NOT NULL,
    "emp_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "isGranted" BOOLEAN NOT NULL,

    CONSTRAINT "extra_permissions_pkey" PRIMARY KEY ("extrapermission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extra_permissions_emp_id_permission_id_key" ON "extra_permissions"("emp_id", "permission_id");

-- AddForeignKey
ALTER TABLE "extra_permissions" ADD CONSTRAINT "extra_permissions_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employees"("emp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extra_permissions" ADD CONSTRAINT "extra_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;
