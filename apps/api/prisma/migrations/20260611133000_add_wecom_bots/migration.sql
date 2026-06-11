CREATE TYPE "WecomBotStatus" AS ENUM ('ACTIVE', 'DISABLED');

CREATE TABLE "wecom_bots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "webhook_url" TEXT NOT NULL,
    "secret" TEXT,
    "status" "WecomBotStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wecom_bots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wecom_bots_id_company_id_key" ON "wecom_bots"("id", "company_id");
CREATE INDEX "wecom_bots_company_id_idx" ON "wecom_bots"("company_id");
CREATE INDEX "wecom_bots_company_id_status_idx" ON "wecom_bots"("company_id", "status");

ALTER TABLE "wecom_bots"
ADD CONSTRAINT "wecom_bots_company_id_fkey"
FOREIGN KEY ("company_id") REFERENCES "companies"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
