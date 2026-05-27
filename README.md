# AI My Home

面向资深前端 / 全栈工程师的**演示优先**个人技术站：用可交互 Demo、实时看板与真实 API 证明能力，而不是堆长文介绍。

## 技术栈

- Next.js 16 · React 19 · App Router
- TypeScript · Tailwind CSS 4
- Prisma · PostgreSQL（含 `pg_trgm` 模糊检索）
- Three.js · ECharts · Web Worker
- 默认 **Ollama**（OpenAI 兼容）· Docker Compose

## 首页模块（`/`）

| 区块 | 说明 |
|------|------|
| `#viz` | Three.js 拓扑 + ECharts + 笔记分析（PostgreSQL） |
| `#dashboard` | 全栈看板：Profile / Notes / Chat / Demo Lab 聚合 |
| `#tech-demos` | 工程 Demo：Web Vitals、API 延迟、虚拟列表、状态机、SSE、**Worker 计算**、**pg_trgm vs 内存检索** |
| `#demo-lab` | 架构 / 性能 / 工作流判断台 |
| `#topology` | 能力连接图 |

## 本地开发

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm db:push && pnpm db:seed
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 环境变量（`.env.example`）

- `DATABASE_URL` — PostgreSQL
- `ADMIN_SECRET` — Notes 增删
- `LLM_PROVIDER=ollama` — 本地 Ollama（`OLLAMA_BASE_URL` / `OLLAMA_MODEL`）
- 云端模型：设 `LLM_PROVIDER=openai` 并填写 `OPENAI_*`

### 可选：启用 pg_trgm

```bash
psql "$DATABASE_URL" -f prisma/sql/pg_trgm.sql
```

未启用时检索自动回退到内存打分；工程 Demo 中可用 `?engine=memory` 强制对比。

### Ollama

```bash
ollama pull llama3.2
ollama serve
```

Assistant（`/assistant`）与 `/api/chat` 使用同一套 LLM 配置。

## API 速览

- `GET /api/profile` — 结构化简历 JSON
- `GET /api/dashboard` — 首页看板聚合
- `GET /api/notes/search?q=&limit=&engine=memory` — 笔记检索（默认 pg_trgm，可强制 memory）
- `GET /api/analytics/notes` — 图表数据
- `POST /api/chat` — SSE / JSON 对话
- `GET /api/health` — DB / LLM / pg_trgm 状态（首页实时探测）

## Docker

```bash
docker compose up --build
```

数据库未初始化时站点回退到内置内容；执行 `pnpm db:push && pnpm db:seed` 后切到 DB 数据源。

## CI

`main` 分支 push / PR 会运行 `pnpm typecheck`、`pnpm lint`、`pnpm build`（见 `.github/workflows/ci.yml`）。

## 仓库

https://github.com/jiaxiantao/ai-my-home
