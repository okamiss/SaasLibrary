CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "CompanyPlan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');

CREATE TABLE "companies" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
  "plan" "CompanyPlan" NOT NULL DEFAULT 'FREE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "company_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_company_id_email_key" ON "users"("company_id", "email");
CREATE INDEX "users_company_id_idx" ON "users"("company_id");
CREATE INDEX "users_email_idx" ON "users"("email");

ALTER TABLE "users"
  ADD CONSTRAINT "users_company_id_fkey"
  FOREIGN KEY ("company_id")
  REFERENCES "companies"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
