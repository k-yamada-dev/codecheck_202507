/*
  Warnings:

  - You are about to drop the column `identity_sub` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `billing_usage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tenant_id` to the `logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_tenant_id_user_id_fkey";

-- DropIndex
DROP INDEX "users_identity_sub_key";

-- DropIndex
DROP INDEX "users_tenant_id_id_key";

-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "logs" ADD COLUMN     "details" JSONB,
ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "identity_sub",
DROP COLUMN "roles",
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "billing_usage";

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenant_code" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_usages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "uploads" INTEGER NOT NULL,
    "api_calls" INTEGER NOT NULL,
    "storage_gb" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "is_finalized" BOOLEAN NOT NULL DEFAULT false,
    "finalized_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_tenant_code_key" ON "tenants"("tenant_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_usages" ADD CONSTRAINT "billing_usages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
