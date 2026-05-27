# AI My Home

一个偏专业、沉稳风格的个人技术门户，用来展示前端深度、工程思考和长期知识沉淀能力。

## 技术栈

- `Next.js 16` + `React 19` + `App Router`
- `TypeScript`
- `Tailwind CSS 4`
- `Prisma`
- `PostgreSQL`
- `Docker` / `Docker Compose`
- `pnpm`

## 站点结构

- 首页：建立整体技术形象，突出定位、能力域、案例表达与方法论
- 领域详情页：点开单个技术板块后展示更深入的判断、原则与专题内容
- Prisma 数据层：支持将领域、专题、案例沉淀到数据库，便于后续扩展后台或 CMS
- Notes：支持将笔记持久化到 PostgreSQL，并进行新增、删除与检索
- Assistant：通过 OpenAI 兼容模型结合笔记内容进行问答
- Docker 部署：让本地和部署环境保持一致

## 本地开发

1. 安装依赖

```bash
pnpm install
```

2. 创建环境变量

```bash
cp .env.example .env
```

并补充以下值：

- `ADMIN_SECRET`：用于新增 / 删除笔记的简单管理密钥
- `OPENAI_BASE_URL`：OpenAI 兼容接口地址
- `OPENAI_API_KEY`：模型接口密钥
- `OPENAI_MODEL`：默认对话模型

3. 启动 PostgreSQL（任选一种方式）

```bash
docker compose up -d db
```

4. 初始化数据库并填充示例内容

```bash
pnpm db:push
pnpm db:seed
```

5. 启动开发环境

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可查看。

## Docker 部署

```bash
docker compose up --build
```

默认会启动：

- `web`：Next.js 应用，端口 `3000`
- `db`：PostgreSQL，端口 `5432`

如果数据库尚未初始化，当前站点也会自动回退到本地内置内容，保证页面可访问。后续你再执行 `pnpm db:push && pnpm db:seed` 即可切到数据库数据源。

## Notes / Assistant

- `Notes` 页面用于查看笔记列表，并通过 `ADMIN_SECRET` 新增或删除笔记
- `Assistant` 页面会先检索数据库中的相关笔记，再把命中的内容作为上下文调用大模型回答问题
- 第一版检索采用轻量关键词召回，不依赖向量数据库，便于快速落地

## 后续建议

这个项目已经具备一个很好的“资深工程师展示站”骨架，下一步你可以继续增强：

- 增加 `articles`、`timeline`、`resume`、`contact` 等内容模块
- 接入后台录入或 CMS，让内容维护更顺手
- 增加埋点、监控、SEO 结构化数据和 OG 动态图片
- 补充 CI、单测 / E2E，进一步体现工程成熟度
