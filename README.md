# AI Company Assistant

SaaS multi-tenant AI knowledge base assistant for SMEs. Administrators upload company documents, the backend stores original files in Aliyun OSS, parses and embeds document chunks asynchronously, and employees can test knowledge-base Q&A from the web console with source citations.

## MVP Scope

Included:

- Company registration and admin login
- Multi-tenant data isolation through `company_id`
- Document upload, listing, detail, delete, and reparse
- Aliyun OSS original-file storage
- PostgreSQL metadata storage and pgvector chunk embeddings
- Redis + BullMQ asynchronous document parsing
- Ask AI test page with answer and source citations
- Chat logs page
- Enterprise WeCom group robot webhook configuration and test send
- Docker Compose local stack

Not included in MVP:

- Enterprise WeCom self-built app
- WeCom callback events or group-message receiving
- WeCom OAuth login
- Contact sync
- Complex RBAC or audit system
- Billing, payment, private deployment management, or agent workflows
- Frontend direct upload to OSS

## Tech Stack

- Frontend: React, Vite, TypeScript, Ant Design, TanStack Query, Zustand, Axios
- Backend: NestJS, TypeScript
- Database: PostgreSQL with pgvector
- ORM: Prisma
- Queue: Redis + BullMQ
- Storage: Aliyun OSS
- AI providers: DeepSeek or OpenAI-compatible chat provider
- Embedding providers: Aliyun DashScope-compatible, Zhipu-compatible, or OpenAI-compatible
- Package manager: pnpm

## Project Structure

```text
apps/
  api/                 NestJS API, Prisma schema, workers, repositories
  web/                 React/Vite frontend
packages/
  shared/              Shared TypeScript types
docker-compose.yml     Local Postgres, Redis, API, and web services
.env.example           Environment variable template
pnpm-workspace.yaml    Monorepo workspace configuration
```

Frontend structure:

```text
apps/web/src/
  api/                 Axios API clients
  queries/             TanStack Query hooks
  stores/              Zustand client state
  components/          Shared UI components
  layouts/             Dashboard shell
  pages/               Route pages
  router/              React Router setup
  utils/               Formatting and error helpers
```

Backend layering:

```text
Controller -> Service -> Repository -> Prisma
```

Controllers do not access Prisma directly. Business data queries must include `company_id` filtering.

## Environment Variables

Create a local `.env` from the template:

```powershell
Copy-Item .env.example .env
```

Core variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode |
| `PORT` | API port, default `3000` |
| `DATABASE_URL` | PostgreSQL connection string for local CLI commands |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Docker Postgres settings |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT signing settings |
| `VITE_API_BASE_URL` | Browser-facing API base URL. Use `http://localhost:3000` for local dev or `http://localhost:38082` for Docker Compose |

Aliyun OSS:

| Variable | Purpose |
| --- | --- |
| `ALI_OSS_REGION` | OSS region, for example `oss-cn-shanghai` |
| `ALI_OSS_BUCKET` | OSS bucket name |
| `ALI_OSS_ACCESS_KEY_ID` | OSS access key ID |
| `ALI_OSS_ACCESS_KEY_SECRET` | OSS access key secret |
| `ALI_OSS_ENDPOINT` | Optional OSS endpoint |

Original files are uploaded to OSS. The database only stores metadata such as `file_key`, file size, MIME type, and parse status.

Chat provider:

| Variable | Purpose |
| --- | --- |
| `CHAT_PROVIDER` | `deepseek` or `openai`; default is `deepseek` |
| `DEEPSEEK_API_KEY` | DeepSeek API key |
| `DEEPSEEK_BASE_URL` | DeepSeek-compatible base URL |
| `DEEPSEEK_MODEL` | DeepSeek chat model |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_BASE_URL` | OpenAI-compatible base URL, default `https://api.openai.com/v1` |
| `OPENAI_MODEL` | OpenAI chat model |

Embedding provider:

| Variable | Purpose |
| --- | --- |
| `EMBEDDING_PROVIDER` | `aliyun`, `zhipu`, or `openai`; default is `aliyun` |
| `ALI_EMBEDDING_API_KEY` | Aliyun DashScope-compatible embedding API key |
| `ALI_EMBEDDING_BASE_URL` | Aliyun compatible-mode base URL |
| `ALI_EMBEDDING_MODEL` | Aliyun embedding model |
| `ZHIPU_API_KEY` | Zhipu API key |
| `ZHIPU_EMBEDDING_BASE_URL` | Zhipu embedding base URL |
| `ZHIPU_EMBEDDING_MODEL` | Zhipu embedding model |
| `OPENAI_EMBEDDING_MODEL` | OpenAI embedding model, default `text-embedding-3-small` |

OpenAI-compatible providers send `Authorization: Bearer <key>` and JSON requests to `/chat/completions` or `/embeddings`.

## Local Development

Prerequisites:

- Node.js `>=22.12.0`
- pnpm `>=11`
- Docker Desktop or compatible Docker Engine
- Valid Aliyun OSS credentials for document upload
- At least one configured chat provider and embedding provider for full Ask AI flow

Install dependencies:

```powershell
pnpm install
```

Start infrastructure:

```powershell
docker compose up -d postgres redis
```

Run migrations and seed data:

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Seed creates:

- Alpha Company: `admin@alpha.example`
- Beta Company: `admin@beta.example`
- Password for both: `Admin123456`

Start API and web in development mode:

```powershell
pnpm dev
```

Local URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:3000`

The frontend has a Token button in the header. Login/register through the auth API, copy the `accessToken`, then paste it into the Token modal to call protected APIs from the dashboard.

## Docker Compose

Validate the rendered Compose file:

```powershell
docker compose config
```

Start the full local stack:

```powershell
docker compose up -d --build
```

Docker URLs:

- Web: `http://localhost:38083`
- API: `http://localhost:38082`
- PostgreSQL: `localhost:35433`
- Redis: `localhost:36379`

For a fresh Docker database, run migrations from the host against the mapped Postgres port:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:35433/ai_company_assistant"
pnpm --filter @ai-company-assistant/api run prisma:deploy
pnpm db:seed
```

Use real OSS and AI provider credentials in `.env` before testing document upload, parsing, embeddings, and Ask AI.

Stop the stack:

```powershell
docker compose down
```

Remove volumes when you want a clean database:

```powershell
docker compose down -v
```

## Database and Migrations

Development migration workflow:

```powershell
pnpm db:migrate
```

Production-like migration workflow:

```powershell
pnpm --filter @ai-company-assistant/api run prisma:deploy
```

Generate Prisma Client:

```powershell
pnpm db:generate
```

Run seed data:

```powershell
pnpm db:seed
```

Important tables:

- `companies`
- `users`
- `documents`
- `document_chunks`
- `chat_logs`
- `wecom_bots`

Every tenant-owned business table includes `company_id`.

## API Summary

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Company:

- `GET /companies/current`
- `PATCH /companies/current`

Documents:

- `POST /documents/upload`
- `GET /documents`
- `GET /documents/:id`
- `DELETE /documents/:id`
- `POST /documents/:id/reparse`

Chat:

- `POST /chat/ask`
- `GET /chat/logs`

WeCom:

- `POST /wecom/bots`
- `GET /wecom/bots`
- `DELETE /wecom/bots/:id`
- `POST /wecom/bots/:id/test-send`

Protected APIs require:

```http
Authorization: Bearer <accessToken>
```

## WeCom Bot Setup

1. In an enterprise WeCom group, add a group robot.
2. Copy the webhook URL. It must look like:

```text
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...
```

3. Open the web console.
4. Paste a valid access token in the header Token modal.
5. Go to `Integrations -> WeCom Bot`.
6. Create a bot configuration.
7. Use Test to send a `markdown` or `text` message.

MVP only sends messages through group robot webhooks. It does not receive group messages.

## MVP Acceptance Checklist

| Item | Status | Notes |
| --- | --- | --- |
| `docker compose up -d --build` starts the stack | Verified | API and web return HTTP 200; full OSS/AI/WeCom business flow still needs real `.env` credentials |
| Admin can register a company account | Implemented | `POST /auth/register` |
| Upload PDF / Word / TXT files | Implemented | Requires valid OSS credentials |
| Original files go to Aliyun OSS | Implemented | `OssService` uploads original file bytes |
| `documents` stores OSS key and metadata only | Implemented | No original file content in database |
| Documents parse asynchronously | Implemented | Redis + BullMQ `parse-document` job |
| `document_chunks` stores text chunks and embeddings | Implemented | Requires embedding provider credentials |
| Backend Ask AI page can ask the knowledge base | Implemented | `/ask-ai`, `POST /chat/ask` |
| AI answers only from current company retrieval | Implemented | Retrieval uses `company_id` filters |
| Company A cannot retrieve Company B data | Implemented by design | Repository queries include `companyId` |
| WeCom bot can test-send messages | Implemented | Requires valid WeCom webhook |
| Chat logs persist to `chat_logs` | Implemented | `ChatService` writes logs |
| Frontend shows AI answer source citations | Implemented | Sources card shows file, snippet, similarity |
| README provides startup and deployment instructions | Implemented | This document |

## Known TODOs

- Add a real login/register UI. Current MVP uses auth APIs plus the frontend Token modal.
- Add production Dockerfiles if deploying outside local Docker Compose.
- Add health checks and startup wait scripts for API/web containers.
- Add automated end-to-end tests for upload -> parse -> ask flow with real provider credentials.
- Add WeCom answer push from Ask AI results if product scope requires it in a later phase.

## Verification Commands

Run before submitting changes:

```powershell
pnpm install
pnpm lint
pnpm build
docker compose config
```

Optional runtime check:

```powershell
docker compose up -d --build
docker compose ps
```
