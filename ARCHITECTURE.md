# Architecture

## Multi Tenant

所有业务表必须包含：

company_id

所有查询必须带：

where: {
  companyId: currentCompanyId
}

禁止：

findMany({})
findFirst({})
不带 company_id 的查询

---

## Storage

原始文件：

OSS

数据库：

仅保存元数据

---

## RAG

Document
→ Chunk
→ Embedding
→ pgvector
→ Retrieval
→ LLM

---

## Layer

Controller
→ Service
→ Repository

禁止：

Controller 直接访问 Prisma

---

## AI Provider

Provider Pattern

ChatProvider
EmbeddingProvider

方便后续切换：

DeepSeek
OpenAI
阿里百炼
智谱