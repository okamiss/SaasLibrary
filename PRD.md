我要从 0 到 1 开发一个 SaaS 多租户架构的企业微信 AI 知识库助手 MVP。

产品定位：
面向中小企业的 AI 企业知识库助手。企业管理员上传内部资料后，员工可以在后台测试页或企业微信入口向 AI 提问，AI 根据企业自己的知识库资料回答。

重要说明：
这是 SaaS 多租户架构，不是一个客户一套代码。
所有企业共用同一套系统、同一个数据库，通过 company_id / tenant_id 做数据隔离。
所有业务查询必须带 company_id，禁止跨企业读取数据。

技术栈：

* 前端：React + Vite + TypeScript + Ant Design
* 后端：NestJS + TypeScript
* 数据库：PostgreSQL + pgvector
* ORM：Prisma
* 队列：Redis + BullMQ
* 文件存储：阿里云 OSS
* AI 问答模型：优先适配 DeepSeek，同时预留 OpenAI Responses API
* Embedding 模型：
MVP 默认使用国内可访问的 Embedding 服务，例如阿里云百炼 text-embedding 或智谱 Embedding-3。
同时将 EmbeddingProvider 抽象出来，后续可切换 OpenAI text-embedding-3-small、阿里云、智谱、百度、火山等服务。
* 企业微信：MVP 先实现企业微信群机器人 webhook 发送能力；注意群机器人只能发送消息，不能直接接收群内提问。后续预留企业微信自建应用回调能力
* 部署：Docker Compose
* 包管理：pnpm
* 项目结构：monorepo

项目结构：
ai-company-assistant/
├── apps/
│   ├── web/              # React 前端
│   └── api/              # NestJS 后端
├── packages/
│   └── shared/           # 公共类型、工具函数
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
├── package.json
└── README.md

核心业务闭环：

1. 企业注册 / 创建企业
2. 企业管理员登录后台
3. 管理员上传 PDF / Word / Excel / TXT / Markdown 文件
4. 原始文件上传到阿里云 OSS
5. PostgreSQL 只保存文件元信息，不保存原始文件
6. 后端使用 Redis + BullMQ 异步解析文件内容
7. 将解析后的文本切片 chunk
8. 调用 embedding API 生成向量
9. 将 chunk 文本和 embedding 存入 PostgreSQL pgvector
10. 员工在后台测试页提问
11. 系统根据 company_id 只检索当前企业的知识库
12. 找到相关 chunk 后，调用 DeepSeek 或 OpenAI 生成回答
13. AI 回答必须基于知识库内容，不允许编造
14. 回复到后台页面，并可通过企业微信群机器人 webhook 主动推送到群里

核心表设计：

* companies
* users
* documents
* document_chunks
* chat_logs
* wecom_bots

companies：

* id
* name
* status
* plan
* created_at
* updated_at

users：

* id
* company_id
* name
* email
* password_hash
* role：admin / member
* created_at
* updated_at

documents：

* id
* company_id
* uploaded_by
* original_name
* file_key
* file_size
* mime_type
* status：uploaded / parsing / completed / failed
* error_message
* created_at
* updated_at

document_chunks：

* id
* company_id
* document_id
* chunk_index
* content
* embedding vector
* token_count
* metadata jsonb
* created_at

chat_logs：

* id
* company_id
* user_id nullable
* source：web / wecom
* question
* answer
* source_chunks jsonb
* model
* prompt_tokens
* completion_tokens
* created_at

wecom_bots：

* id
* company_id
* name
* webhook_url
* secret nullable
* status
* created_at
* updated_at

OSS 规则：
原始文件不要存数据库，只上传到阿里云 OSS。
数据库只保存 file_key 和文件元信息。

OSS key 格式：
company/{companyId}/documents/{year}/{month}/{documentId}-{filename}

环境变量：
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=

ALI_OSS_REGION=
ALI_OSS_BUCKET=
ALI_OSS_ACCESS_KEY_ID=
ALI_OSS_ACCESS_KEY_SECRET=
ALI_OSS_ENDPOINT=

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=
DEEPSEEK_MODEL=

OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

后端模块：

* AuthModule
* CompanyModule
* UserModule
* DocumentModule
* OssModule
* ParserModule
* EmbeddingModule
* ChatModule
* WecomModule
* QueueModule
* BillingModule：只预留，不做复杂计费

核心接口：
认证：

* POST /auth/register
* POST /auth/login
* GET /auth/me

企业：

* GET /companies/current
* PATCH /companies/current

文档：

* POST /documents/upload
* GET /documents
* GET /documents/:id
* DELETE /documents/:id
* POST /documents/:id/reparse

问答：

* POST /chat/ask
* GET /chat/logs

企业微信：

* POST /wecom/bots
* GET /wecom/bots
* DELETE /wecom/bots/:id
* POST /wecom/bots/:id/test-send

文件上传流程：

1. 前端选择文件
2. 调用 POST /documents/upload
3. NestJS 接收 multipart file
4. 后端校验文件大小和类型
5. 后端上传原始文件到阿里云 OSS
6. documents 表创建记录，status = uploaded
7. 添加 BullMQ 队列任务 parse-document
8. 返回文档记录给前端

文件解析队列流程：

1. Worker 收到 parse-document 任务
2. documents.status 改为 parsing
3. 根据 file_key 从 OSS 下载文件
4. 根据 mime_type 判断解析方式
5. PDF 使用 pdf-parse
6. Word 使用 mammoth
7. Excel 使用 xlsx
8. TXT / Markdown 直接读取文本
9. 提取纯文本
10. 清洗文本
11. 按 500~1000 中文字切片
12. 每个 chunk 调用 embedding
13. 写入 document_chunks
14. documents.status 改为 completed
15. 如果失败，documents.status 改为 failed，并保存 error_message

向量检索要求：
使用 PostgreSQL pgvector。
document_chunks.embedding 字段使用 vector 类型。
检索时必须加 company_id 条件。

问答逻辑：

1. 用户问题生成 query embedding
2. 查询当前 company_id 下相似度最高的 5~10 个 chunks
3. 将 chunks 拼入 prompt
4. 调用 DeepSeek 或 OpenAI 生成回答
5. 保存 chat_logs
6. 返回 answer 和 sources

AI 系统提示词：
你是企业内部知识库助手。
你只能根据【资料内容】回答问题。
如果资料内容中没有答案，请回答：“资料中没有找到相关信息。”
不要编造，不要使用资料外的信息。
回答要简洁、准确、适合企业员工阅读。
如果涉及流程，请用步骤列出。
如果涉及制度，请明确引用来源文档名称。

Prompt 结构：
【资料内容】
{retrieved_chunks}

【用户问题】
{question}

【回答要求】

* 只根据资料内容回答
* 不知道就说资料中没有找到相关信息
* 不要编造
* 尽量简洁
* 返回中文

企业微信 MVP：
第一版只做企业微信群机器人 webhook 发送能力：

* 后台配置 webhook_url
* 后台测试发送消息
* 后台问答完成后可以选择推送回答到企业微信群

注意：
企业微信群机器人 webhook 通常只能发送消息，不能直接接收群内用户提问。
如果要实现“员工在企业微信群里提问，AI 自动回答”，后续需要接入企业微信自建应用、回调事件、通讯录和消息能力。

前端页面：

1. 登录页
2. 注册页
3. 当前企业 Dashboard
4. 文档管理页

   * 上传文件
   * 文件列表
   * 解析状态
   * 删除文件
   * 重新解析
5. 问答测试页

   * 输入问题
   * 显示 AI 回答
   * 显示引用来源
6. 企业微信机器人配置页

   * 新增机器人
   * webhook 地址
   * 测试发送
7. 聊天记录页

MVP 阶段不要做：

* 不要做复杂计费
* 不要做微信支付
* 不要做复杂 RBAC
* 不要做 Agent 工作流
* 不要做 MCP
* 不要做私有化部署管理平台
* 不要做复杂多模型路由
* 不要做前端直传 OSS
* 不要做复杂审计系统

MVP 阶段必须做：

* SaaS 多租户 company_id 隔离
* 阿里云 OSS 存原始文件
* PostgreSQL 存文件元信息
* pgvector 存 embedding
* Redis + BullMQ 异步解析
* 后台文档上传
* 后台测试问答
* 企业微信机器人 webhook 发送能力
* Docker Compose 一键启动

Docker Compose 包含：

* api
* web
* postgres with pgvector
* redis

需要提供：

1. 完整项目初始化
2. Prisma schema
3. 数据库 migration
4. docker-compose.yml
5. .env.example
6. README.md
7. 本地启动命令
8. 基础 seed 数据
9. 可运行的最小 MVP

开发顺序：
第一步：初始化 monorepo、React、NestJS、Docker Compose
第二步：接 PostgreSQL、Prisma、Redis
第三步：实现用户注册登录和 company 创建
第四步：实现阿里云 OSS 上传服务
第五步：实现文档上传和 documents 表
第六步：实现 BullMQ 文档解析队列
第七步：实现文档解析、切片、embedding、pgvector 入库
第八步：实现 /chat/ask 问答接口
第九步：实现前端文档管理页和问答测试页
第十步：实现企业微信机器人配置和测试发送
第十一步：完善 README 和部署说明

验收标准：

1. docker compose up -d 后项目可以启动
2. 管理员可以注册企业账号
3. 可以上传 PDF / Word / TXT 文件
4. 文件原始内容进入阿里云 OSS
5. 数据库 documents 只保存 OSS file_key 和元信息
6. 文档可以被异步解析
7. document_chunks 中可以看到文本切片和 embedding
8. 后台测试页可以向知识库提问
9. AI 只能根据当前企业资料回答
10. 企业 A 不能检索到企业 B 的资料
11. 企业微信机器人可以测试发送消息
12. 聊天记录可以保存到 chat_logs

请先实现 MVP，代码保持清晰、简单、可运行。不要过度设计。