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
| `#front-intelligence` | **前端智能化**：浏览器内意图识别、Prompt 改写、偏好模板，一键带入 Assistant |
| `#edge-ai` | **端侧智能**：Transformers.js 情感分类、WASM/Worker 基准、MediaPipe 姿势、Prompt 编排 |
| `#tech-demos` | 工程 Demo：Web Vitals、API 延迟、虚拟列表、状态机、SSE、**Worker 计算**、**pg_trgm vs 内存检索** |
| `#demo-lab` | 架构 / 性能 / 工作流判断台 |
| `#release-center` | **工程化发布单**：应用注册、构建、测试/预发/生产门禁、审计与回滚 |
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

## GitHub Pages 在线预览

静态演示：<https://jiaxiantao.xyz/ai-my-home/>（Cloudflare 路径路由）

根路径入口：<https://jiaxiantao.xyz/> → 302 到 `/ai-my-home/`  
`www` 会 301 到裸域（避免双主机名缓存导致样式异常）。  
源站：<https://jiaxiantao.github.io/ai-my-home/>

Pages 配置：**GitHub Actions**。`main` 推送后只会触发一次 `CI` workflow：
先跑校验，再执行 `pnpm build:pages`，将 `out/` 上传为 Pages artifact 并由
`actions/deploy-pages` 发布。PR 只跑校验、不部署。

```bash
pnpm build:pages   # 本地验证静态导出
```

GitHub Pages 为纯静态站点：简历、工程 Demo、端侧 AI、Cases / Insights 可浏览；`/api/*`、登录写库、Assistant 对话等需服务端的能力在预览站不可用。完整全栈请用 Docker 或 `pnpm dev`。

多项目自定义域名路径路由（`/`、`/ai-my-home`、`/cos-design`…）见 [docs/cloudflare-path-router.md](./docs/cloudflare-path-router.md)。

### 发布中心与数据库

`pnpm db:setup`（`prisma db push` + `seed`）会创建并初始化：

- `ReleaseApp` / `ReleaseOrder` / `ReleaseAuditLog`（发布中心持久化）
- 默认应用 `ai-my-home-web`（见 `prisma/seed.ts`）

若已配置 `DATABASE_URL` 但未执行 `db:setup`，发布中心会**自动降级为进程内内存存储**（开发环境控制台会提示），站点仍可运行，但重启后发布单不保留。执行 `pnpm db:setup` 后即可写入 PostgreSQL。

> `pnpm db:seed` 会清空并重建发布中心演示数据，请勿在生产库随意执行。

### 环境变量（`.env.example`）

- `DATABASE_URL` — PostgreSQL
- `AUTH_TOKEN_SECRET` — 管理员 Token 签名密钥
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — 管理员登录凭据
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

Assistant（`/assistant`）与 `/api/chat` 使用同一套 LLM 配置。Agent 工具循环已拆至独立项目 [home-agent](https://jiaxiantao.github.io/home-agent/)。

### 独立演示项目

| 项目 | 预览 | 仓库 |
|------|------|------|
| **本站点** | [jiaxiantao.xyz/ai-my-home](https://jiaxiantao.xyz/ai-my-home/) | [ai-my-home](https://github.com/jiaxiantao/ai-my-home) |
| 博客 | [jiaxiantao.xyz/blogs](https://jiaxiantao.xyz/blogs/) | [blogs](https://github.com/jiaxiantao/blogs) |
| 3D 看车 | [jiaxiantao.xyz/3d-car-viewing](https://jiaxiantao.xyz/3d-car-viewing/) | [3d-car-viewing](https://github.com/jiaxiantao/3d-car-viewing) |
| Agent 编排 | [jiaxiantao.xyz/home-agent](https://jiaxiantao.xyz/home-agent/) | [home-agent](https://github.com/jiaxiantao/home-agent) |

本站导航与 `/car-showroom`、`/agents` 会跳转到对应外部地址。

### 前端智能化（Front Intelligence）

- 首页 `#front-intelligence`：纯前端规则引擎 `analyzeComposer()`，识别架构/性能/排查等意图并改写 Prompt
- `POST /api/intelligence/analyze`：同上能力的 HTTP 接口（冒烟测试覆盖）
- `/assistant`：编排结果 + 笔记检索 + LLM 对话；偏好与学习画像可经 `PUT /api/intelligence/profile` 持久化（admin）
- 登录 admin 后，Assistant 的偏好会自动与云端画像同步

### 端侧 AI

- 首页 `#edge-ai`：按需加载 `@xenova/transformers`、`@mediapipe/tasks-vision`（首次会下载模型）
- Agent 编排见 [home-agent 在线演示](https://jiaxiantao.github.io/home-agent/)

### VS Code 插件（演示）

```bash
cd extensions/vscode-ai-assistant
npm install && npm run compile
```

F5 启动扩展开发宿主；命令：解释 / 补全 / 重构选中代码（调用本站 Chat API）。详见 `extensions/vscode-ai-assistant/README.md`。

## API 速览

- `GET /api/profile` — 结构化简历 JSON
- `GET /api/dashboard` — 首页看板聚合（含 `intelligence.samplePrompts`）
- `POST /api/intelligence/analyze` — 前端智能化 Prompt 分析（意图 / 改写 / 动作建议）
- `GET/PUT /api/intelligence/profile` — 智能化偏好与学习画像（admin）
- `GET /api/notes/search?q=&limit=&engine=memory` — 笔记检索（默认 pg_trgm，可强制 memory）
- `GET /api/analytics/notes` — 图表数据
- `POST /api/chat` — SSE / JSON 对话
- `GET /api/health` — DB / LLM / pg_trgm 状态（首页实时探测）
- `GET /api/release/apps` — 发布中心应用列表
- `GET /api/release/orders` — 发布单列表
- `POST /api/release/orders` — 创建发布单（需 admin）
- `POST /api/release/orders/[id]/action` — 构建 / 门禁 / 分环境发布 / 生产回滚（需 admin）

发布中心数据持久化在 PostgreSQL（`ReleaseApp` / `ReleaseOrder` / `ReleaseAuditLog`），`pnpm db:seed` 会预置默认应用。

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

覆盖 `/api/health`、`/profile`、`/dashboard`（含 `capabilityProfile` / `release`）、`/notes/search`、`/analytics/notes`、`/release/apps`、`/release/orders`。CI 在 `pnpm build` 后会启动生产服务并自动执行 `pnpm smoke`。

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
