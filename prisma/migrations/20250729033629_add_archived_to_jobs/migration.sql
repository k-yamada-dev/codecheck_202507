-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false;
