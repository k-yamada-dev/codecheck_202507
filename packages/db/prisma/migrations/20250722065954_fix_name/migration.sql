/*
  Warnings:

  - You are about to drop the column `createdAt` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `durationMs` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `resultUrl` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `srcImagePath` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailPath` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `identitySub` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tenantCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `BillingUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[identity_sub]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,provider,external_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_url` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `src_image_path` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identity_sub` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_jobId_fkey";

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_tenantId_userId_fkey";

-- DropIndex
DROP INDEX "jobs_tenantId_type_startedAt_idx";

-- DropIndex
DROP INDEX "users_identitySub_key";

-- DropIndex
DROP INDEX "users_tenantId_id_key";

-- DropIndex
DROP INDEX "users_tenantId_provider_externalId_key";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "createdAt",
DROP COLUMN "durationMs",
DROP COLUMN "finishedAt",
DROP COLUMN "imageUrl",
DROP COLUMN "resultUrl",
DROP COLUMN "srcImagePath",
DROP COLUMN "startedAt",
DROP COLUMN "tenantId",
DROP COLUMN "thumbnailPath",
DROP COLUMN "userId",
DROP COLUMN "userName",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration_ms" INTEGER,
ADD COLUMN     "finished_at" TIMESTAMPTZ(6),
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "result_url" TEXT,
ADD COLUMN     "src_image_path" TEXT NOT NULL,
ADD COLUMN     "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ADD COLUMN     "thumbnail_path" TEXT,
ADD COLUMN     "user_id" UUID NOT NULL,
ADD COLUMN     "user_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "externalId",
DROP COLUMN "identitySub",
DROP COLUMN "isDeleted",
DROP COLUMN "tenantCode",
DROP COLUMN "tenantId",
DROP COLUMN "updatedAt",
DROP COLUMN "userCode",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "external_id" TEXT NOT NULL,
ADD COLUMN     "identity_sub" TEXT NOT NULL,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tenant_code" TEXT,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_code" TEXT;

-- DropTable
DROP TABLE "BillingUsage";

-- DropTable
DROP TABLE "Log";

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "job_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_usage" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "uploads" INTEGER NOT NULL,
    "api_calls" INTEGER NOT NULL,
    "storage_gb" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_jobs__tenant_type_started_at" ON "jobs"("tenant_id", "type", "started_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "users_identity_sub_key" ON "users"("identity_sub");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_provider_external_id_key" ON "users"("tenant_id", "provider", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_id_key" ON "users"("tenant_id", "id");

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_tenant_id_user_id_fkey" FOREIGN KEY ("tenant_id", "user_id") REFERENCES "users"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
