/*
  Warnings:

  - Changed the type of `type` on the `jobs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `jobs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('EMBED', 'DECODE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'ERROR');

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "type",
ADD COLUMN     "type" "JobType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "JobStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "jobs_tenantId_type_startedAt_idx" ON "jobs"("tenantId", "type", "startedAt" DESC);

-- Optional extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
