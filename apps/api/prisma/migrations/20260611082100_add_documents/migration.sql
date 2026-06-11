CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PARSING', 'COMPLETED', 'FAILED');

CREATE TABLE "documents" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "company_id" UUID NOT NULL,
  "uploaded_by" UUID NOT NULL,
  "original_name" TEXT NOT NULL,
  "file_key" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL,
  "mime_type" TEXT NOT NULL,
  "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
  "error_message" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_chunks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "company_id" UUID NOT NULL,
  "document_id" UUID NOT NULL,
  "chunk_index" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "embedding" vector,
  "token_count" INTEGER,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "documents_id_company_id_key" ON "documents"("id", "company_id");
CREATE INDEX "documents_company_id_idx" ON "documents"("company_id");
CREATE INDEX "documents_company_id_status_idx" ON "documents"("company_id", "status");

CREATE UNIQUE INDEX "document_chunks_document_id_chunk_index_key" ON "document_chunks"("document_id", "chunk_index");
CREATE INDEX "document_chunks_company_id_idx" ON "document_chunks"("company_id");
CREATE INDEX "document_chunks_company_id_document_id_idx" ON "document_chunks"("company_id", "document_id");

ALTER TABLE "documents"
  ADD CONSTRAINT "documents_company_id_fkey"
  FOREIGN KEY ("company_id")
  REFERENCES "companies"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "documents"
  ADD CONSTRAINT "documents_uploaded_by_fkey"
  FOREIGN KEY ("uploaded_by")
  REFERENCES "users"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "document_chunks"
  ADD CONSTRAINT "document_chunks_company_id_fkey"
  FOREIGN KEY ("company_id")
  REFERENCES "companies"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "document_chunks"
  ADD CONSTRAINT "document_chunks_document_id_fkey"
  FOREIGN KEY ("document_id")
  REFERENCES "documents"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
