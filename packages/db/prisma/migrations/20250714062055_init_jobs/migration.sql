-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ(6),
    "durationMs" INTEGER,
    "srcImagePath" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "ip" INET,
    "ua" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_tenantId_type_startedAt_idx" ON "jobs"("tenantId", "type", "startedAt" DESC);

-- Optional extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
