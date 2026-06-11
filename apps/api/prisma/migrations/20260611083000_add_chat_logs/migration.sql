CREATE TYPE "ChatLogSource" AS ENUM ('WEB', 'WECOM');

CREATE TABLE "chat_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "company_id" UUID NOT NULL,
  "user_id" UUID,
  "source" "ChatLogSource" NOT NULL DEFAULT 'WEB',
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "source_chunks" JSONB NOT NULL DEFAULT '[]',
  "model" TEXT NOT NULL,
  "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
  "completion_tokens" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "chat_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_logs_company_id_idx" ON "chat_logs"("company_id");
CREATE INDEX "chat_logs_company_id_created_at_idx" ON "chat_logs"("company_id", "created_at");

ALTER TABLE "chat_logs"
  ADD CONSTRAINT "chat_logs_company_id_fkey"
  FOREIGN KEY ("company_id")
  REFERENCES "companies"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "chat_logs"
  ADD CONSTRAINT "chat_logs_user_id_fkey"
  FOREIGN KEY ("user_id")
  REFERENCES "users"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
