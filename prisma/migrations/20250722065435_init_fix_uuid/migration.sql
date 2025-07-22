/*
  Warnings:

  - A unique constraint covering the columns `[identitySub]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageUrl` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identitySub` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('uploader', 'downloader', 'auditor', 'tenant_admin', 'internal_admin');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "resultUrl" TEXT,
ADD COLUMN     "watermark" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "identitySub" TEXT NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "tenantCode" TEXT,
ADD COLUMN     "userCode" TEXT;

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "jobId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingUsage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "uploads" INTEGER NOT NULL,
    "apiCalls" INTEGER NOT NULL,
    "storageGB" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_identitySub_key" ON "users"("identitySub");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
