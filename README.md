# AI My Home

面向资深前端 / 全栈工程师的**演示优先**个人技术站：用可交互 Demo、实时看板与真实 API 证明能力，而不是堆长文介绍。

## 技术栈

- Next.js 16 · React 19 · App Router
- TypeScript · Tailwind CSS 4
- Prisma · PostgreSQL（含 `pg_trgm` 模糊检索）
- Three.js · ECharts · Web Worker
- **Transformers.js** · **MediaPipe Tasks Vision**（浏览器端推理）
- 默认 **Ollama**（OpenAI 兼容）· Docker Compose

## 首页模块（`/`）

| 区块 | 说明 |
|------|------|
| `#viz` | Three.js 拓扑 + ECharts + 笔记分析（PostgreSQL） |
| `#dashboard` | 全栈看板：Profile / Notes / Chat / Demo Lab 聚合 |
| `#cross-platform` | **大前端**：移动端 H5 视口、小程序分层、桌面运行时选型（可切换交互 Demo） |
| `#edge-ai` | **端侧智能**：Transformers.js 情感分类、WASM/Worker 基准、MediaPipe 姿势、Agent 工具循环 |
| `#tech-demos` | 工程 Demo：Web Vitals、API 延迟、虚拟列表、状态机、SSE、**Worker 计算**、**pg_trgm vs 内存检索** |
| `#demo-lab` | 架构 / 性能 / 工作流判断台 |
| `#topology` | 能力连接图 |

## 本地开发

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm db:setup
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 环境变量（`.env.example`）

- `DATABASE_URL` — PostgreSQL
- `ADMIN_SECRET` — Notes 增删
- `LLM_PROVIDER=ollama` — 本地 Ollama（`OLLAMA_BASE_URL` / `OLLAMA_MODEL`）
- 云端模型：设 `LLM_PROVIDER=openai` 并填写 `OPENAI_*`

### pg_trgm

`pnpm db:seed` 会尝试 `CREATE EXTENSION IF NOT EXISTS pg_trgm`（需数据库权限）。也可手动执行：

```bash
psql "$DATABASE_URL" -f prisma/sql/pg_trgm.sql
```

未启用时检索自动回退到内存打分；工程 Demo 中可用 `?engine=memory` 强制对比。

### Ollama

```bash
ollama pull llama3.2
ollama serve
```

Assistant（`/assistant`）与 `/api/chat` 使用同一套 LLM 配置。`/agents` 提供工具编排循环（`/api/agent` SSE）。

### 端侧 AI 与 Agent

- 首页 `#edge-ai`：按需加载 `@xenova/transformers`、`@mediapipe/tasks-vision`（首次会下载模型）
- `/agents`：规划 → `search_notes` / `calculate` / `current_time` → 最终回答
- CI 设置 `LLM_DISABLED=1` 时使用规则规划器，不依赖 Ollama

### VS Code 插件（演示）

```bash
cd extensions/vscode-ai-assistant
npm install && npm run compile
```

F5 启动扩展开发宿主；命令：解释 / 补全 / 重构选中代码（调用本站 Chat API）。详见 `extensions/vscode-ai-assistant/README.md`。

## API 速览

- `GET /api/profile` — 结构化简历 JSON
- `GET /api/dashboard` — 首页看板聚合
- `GET /api/notes/search?q=&limit=&engine=memory` — 笔记检索（默认 pg_trgm，可强制 memory）
- `GET /api/analytics/notes` — 图表数据
- `POST /api/chat` — SSE / JSON 对话
- `POST /api/agent` — Agent 工具循环（SSE trace）
- `GET /api/health` — DB / LLM / pg_trgm 状态（首页实时探测）

## Docker

```bash
docker compose up --build
```

Compose 会依次启动：`db` → `migrate`（`pnpm db:setup`）→ `web`。

- 容器内默认 `LLM_PROVIDER=ollama`，通过 `host.docker.internal:11434` 访问宿主机 Ollama（需本机已 `ollama serve`）
- **内置 Ollama**（自动拉取 `llama3.2`，首次较慢）：

```bash
docker compose -f docker-compose.yml -f docker-compose.ollama.yml up --build
```

- 仅重置数据库：`docker compose run --rm migrate`

## API 冒烟测试

```bash
pnpm db:setup
pnpm dev          # 终端 1
pnpm smoke        # 终端 2
```

覆盖 `/api/health`、`/profile`、`/dashboard`、`/notes/search`、`/analytics/notes`。CI 在 `pnpm build` 后会启动生产服务并自动执行 `pnpm smoke`。

## E2E（Playwright）

```bash
pnpm db:setup
pnpm build
pnpm start          # 终端 1（或 CI 已启动服务）
pnpm test:e2e       # 终端 2
```

调试 UI：`pnpm test:e2e:ui`。用例覆盖首页模块、导航、工程 Demo 切换、Notes 检索。

## SEO

- `/sitemap.xml` — 静态页 + cases / insights / domains
- `/robots.txt`

## CI

`main` 分支 push / PR：`typecheck` → `lint` → `db:setup` → `build` → **API smoke** + **Playwright E2E**（见 `.github/workflows/ci.yml`）。

## 仓库

https://github.com/jiaxiantao/ai-my-home
