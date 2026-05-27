import type { IconKey } from "@/lib/icon-map";

export type SiteProfile = {
  name: string;
  title: string;
  tagline: string;
  intro: string;
  summary: string;
  focus: string[];
  philosophy: string[];
  currentFocus: string[];
  email: string;
  github: string;
};

export type SiteMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DomainTopic = {
  title: string;
  summary: string;
  body: string;
};

export type DomainDetail = {
  slug: string;
  title: string;
  strapline: string;
  summary: string;
  overview: string;
  icon: IconKey;
  expertiseLevel: string;
  highlights: string[];
  principles: string[];
  topics: DomainTopic[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  context: string;
  impact: string;
  stack: string[];
  /** 首页证明条：可核对的结果，不写形容词 */
  proofLines: string[];
};

export const siteProfile: SiteProfile = {
  name: "Xiantao Jia",
  title: "Senior Frontend Engineer",
  tagline: "前端 / 全栈 · 架构、性能、AI 工作流",
  intro:
    "6 年复杂 Web 与中后台交付；本站在线演示 BFF、笔记库、检索问答与交互判断台。",
  summary: "用可运行的页面和 API 代替自述。",
  focus: [
    "前端架构与设计系统",
    "大前端与多端交付",
    "工程化与研发效能",
    "性能优化与体验治理",
    "全栈协作与 AI 自动化",
  ],
  philosophy: [
    "先做正确抽象，再做局部优化，避免用短期技巧堆出长期债务。",
    "把稳定性交给规范、工具和自动化，而不是依赖个人记忆。",
    "好的前端不只是写界面，而是对业务价值、用户体验和团队效率同时负责。",
  ],
  currentFocus: [
    "把前端架构、内容沉淀和数据组织放进同一个站点里持续演进。",
    "让 AI 进入真实工作流，而不是停留在临时问答和单次生成。",
    "把复杂项目里的判断、权衡和复盘写成可复用的内容资产。",
  ],
  email: "1374612574@qq.com",
  github: "https://github.com/jiaxiantao",
};

export const siteMetrics: SiteMetric[] = [
  {
    label: "经验年限",
    value: "6 年+",
    detail: "持续参与复杂业务系统、H5 与中后台项目交付",
  },
  {
    label: "核心能力域",
    value: "5 大方向",
    detail: "架构、大前端多端、工程化、性能治理、全栈与 AI",
  },
  {
    label: "交付视角",
    value: "0 -> 1 / 1 -> N",
    detail: "既能从空白搭底座，也能在成熟系统上做治理升级",
  },
  {
    label: "技术表达",
    value: "深度沉淀",
    detail: "把经验整理成结构化内容，用于分享、复盘与面试展示",
  },
];

export const domainDetails: DomainDetail[] = [
  {
    slug: "frontend-architecture",
    title: "前端架构与设计系统",
    strapline: "从页面开发走向系统级设计",
    summary:
      "关注模块边界、状态建模、组件抽象和设计系统，让业务扩张时依旧保持一致性与可维护性。",
    overview:
      "我更看重架构是否能够支撑长期迭代，而不是一次性完成页面。对于复杂系统，我会优先解决边界、约束和复用方式，再决定组件拆分与状态流向。",
    icon: "layout-grid",
    expertiseLevel: "Architecture / Design System / SSR",
    highlights: ["设计系统抽象", "App Router 与服务端组件边界", "复杂状态与可维护性"],
    principles: [
      "用可组合而不是过度封装的方式建设组件体系。",
      "让业务模型驱动视图结构，而不是被页面临时需求牵着走。",
      "在 SSR、SEO、性能与交互灵活性之间做清晰权衡。",
    ],
    topics: [
      {
        title: "组件体系设计",
        summary: "从原子组件到业务组件，保持复用与表达力平衡。",
        body:
          "### 我的关注点\n\n- 组件职责是否单一且可复用\n- API 设计是否稳定、可预期\n- 样式方案是否支持主题与扩展\n\n我更倾向把**设计 token、基础组件、业务组合组件**分层建设，避免所有能力都堆到一个“大而全”的组件里。",
      },
      {
        title: "渲染边界与数据边界",
        summary: "明确哪些内容适合服务端获取，哪些适合客户端增强。",
        body:
          "在 Next.js App Router 体系下，我会先判断：\n\n1. 这个模块是否依赖 SEO 与首屏可见内容\n2. 是否必须在客户端持有交互状态\n3. 数据更新频率和缓存策略是什么\n\n这样可以减少无意义的客户端负担，同时保留良好的交互体验。",
      },
      {
        title: "可扩展信息架构",
        summary: "让站点既适合展示，也适合持续沉淀知识内容。",
        body:
          "我会优先把内容结构和页面关系设计清楚，再决定具体实现。现在这套 **首页总览 + 领域详情页 + 结构化内容数据** 的方式，后续无论继续接文章、案例、时间线还是后台录入，都不需要推翻已有结构。",
      },
    ],
  },
  {
    slug: "engineering-efficiency",
    title: "工程化与研发效能",
    strapline: "把经验变成流程、规范和自动化",
    summary:
      "擅长通过规范、脚手架、CI、代码组织与工具链建设，降低协作成本，提升团队可预期交付能力。",
    overview:
      "工程化的价值不只是“让代码更整洁”，而是降低沟通成本、减少低级错误，并把重复劳动自动化。成熟团队真正拉开差距的，往往是这部分基础设施。",
    icon: "workflow",
    expertiseLevel: "Workflow / CI / DX",
    highlights: ["脚手架与目录规范", "Lint / 类型 / Hook 约束", "协作流程设计"],
    principles: [
      "优先复用现有规范，新增规则必须解决真实问题。",
      "自动化不是炫技，而是为了让正确的事情更容易发生。",
      "研发效能建设要兼顾落地成本和团队接受度。",
    ],
    topics: [
      {
        title: "规范与约束设计",
        summary: "把团队共识沉淀成可执行的规则。",
        body:
          "我会把编码规范拆成三层：\n\n- **静态约束**：ESLint、TypeScript、目录规则\n- **提交约束**：commitlint、lint-staged、hooks\n- **协作约束**：PR 模板、变更说明、回归清单\n\n这样团队不用靠口头提醒来维持质量。",
      },
      {
        title: "脚手架与模板化",
        summary: "减少重复初始化工作，让项目更快进入业务开发。",
        body:
          "我更愿意把脚手架当成一套默认起点，而不是一个生成目录的小工具。我会把依赖、结构、环境、脚本、部署和质量门槛一起放进去，让项目从第一天开始就站在稳定轨道上。",
      },
      {
        title: "面向长期维护的工程判断",
        summary: "不是所有新技术都值得引入，关键在于是否解决当前阶段问题。",
        body:
          "我会根据团队规模、业务复杂度和维护周期来决定技术选型。比如是否引入状态库、是否做 Monorepo、是否拆 BFF，这些都需要以收益和成本为前提。",
      },
    ],
  },
  {
    slug: "performance-experience",
    title: "性能优化与体验治理",
    strapline: "既要快，也要稳定、顺滑、可观测",
    summary:
      "关注加载性能、渲染效率、交互流畅度和稳定性，把用户感知与工程监控结合起来做治理。",
    overview:
      "性能不是一串 Lighthouse 分数，而是用户在真实环境里的主观感受和业务转化的客观结果。我更倾向建立可观测、可回归、可定位的问题治理链路。",
    icon: "gauge",
    expertiseLevel: "Web Vitals / UX / Monitoring",
    highlights: ["首屏与渲染优化", "交互细节治理", "可观测与问题定位"],
    principles: [
      "优先优化高频场景和核心链路，而不是追逐表面分数。",
      "性能优化必须有基线、有指标、有回归验证。",
      "稳定性和体验一致性与纯粹的速度同样重要。",
    ],
    topics: [
      {
        title: "首屏与数据链路",
        summary: "让关键内容更快抵达用户视野。",
        body:
          "我会优先检查：\n\n- 渲染是否过早落到客户端\n- 数据请求是否可以并发或提前\n- 图片、字体、第三方脚本是否拖慢首屏\n\n对营销页、中后台和内容站，优化手段会完全不同。",
      },
      {
        title: "复杂列表与交互性能",
        summary: "避免无意义重渲染，保持响应一致性。",
        body:
          "复杂页面通常卡在状态更新和组件层级上。我会从**状态粒度、组件 memo 化、虚拟列表、动画负担**几个方向排查，而不是先盲目加缓存。",
      },
      {
        title: "监控与回归闭环",
        summary: "把偶发问题变成可分析、可追踪的问题。",
        body:
          "当监控能关联到页面、环境、操作链路和错误上下文时，排查效率会明显提升。好的性能治理，最终一定会落到一套完整的监控与复盘闭环上。",
      },
    ],
  },
  {
    slug: "fullstack-delivery",
    title: "全栈协作与服务端能力",
    strapline: "前端视角下的全链路交付",
    summary:
      "能够从接口设计、数据建模、服务端渲染、缓存策略到部署链路形成完整认知，不把前端局限在浏览器里。",
    overview:
      "我一直把前端工作放在更完整的交付链路里去看。数据库、服务端和部署链路并不是额外负担，反而会让很多页面层面的判断更稳，也让协作更顺畅。",
    icon: "database",
    expertiseLevel: "BFF / Prisma / Data Modeling",
    highlights: ["数据建模", "服务端渲染与缓存", "部署与环境协作"],
    principles: [
      "接口设计要服务于业务模型，而不是简单映射表结构。",
      "服务端能力的引入要明确边界，避免把系统复杂度无节制上推。",
      "部署方案要考虑团队维护成本，而不是只追求理论最优。",
    ],
    topics: [
      {
        title: "数据建模",
        summary: "用结构化模型承接内容、案例与关系数据。",
        body:
          "这个项目里我用 Prisma + PostgreSQL 建模领域、专题与案例，不是为了“用数据库而用数据库”，而是为了让内容具备可扩展性：后续无论接 CMS、后台录入还是多终端展示都更自然。",
      },
      {
        title: "服务端内容组织",
        summary: "把结构化数据与页面渲染有机结合。",
        body:
          "相比把所有内容硬编码在组件里，我更习惯把结构化数据和页面渲染放在一起考虑。这样做更适合处理 SEO、权限、缓存、聚合和多页面复用，也让后续扩展更自然。",
      },
      {
        title: "部署与环境策略",
        summary: "从本地开发到容器化部署，保证一致性。",
        body:
          "我会优先保证本地、测试与部署环境的一致性，尽量减少“只在我电脑上可运行”的问题。Docker 在这里不是点缀，而是工程可靠性的延伸。",
      },
    ],
  },
  {
    slug: "cross-platform-frontend",
    title: "大前端与多端交付",
    strapline: "移动端 · 小程序 · 桌面端同一套工程判断",
    summary:
      "覆盖 H5 移动适配、小程序双线程与宿主差异、Electron / Tauri / Capacitor 桌面选型，把 Web 能力延伸到更多终端。",
    overview:
      "大前端不是多写几个端，而是同一套业务模型下，针对不同运行时做约束、桥接与发布策略。我会先对齐体验与能力边界，再决定是同构、混合还是原生补强。",
    icon: "smartphone",
    expertiseLevel: "H5 / Mini Program / Desktop Runtime",
    highlights: ["移动端视口与安全区", "小程序分层与分包", "桌面运行时选型"],
    principles: [
      "先定能力矩阵和降级策略，再选框架，而不是先选 Taro 或 Electron。",
      "跨端复用的是业务模型与接口契约，不是把 DOM API 硬搬到每个端。",
      "发布链路、包体、权限与审核约束和页面实现同等重要。",
    ],
    topics: [
      {
        title: "移动端 H5 交付",
        summary: "视口、安全区、触控热区与资源策略决定真实体验。",
        body:
          "我会优先处理 viewport、safe-area、软键盘顶起和 1x/2x/3x 资源，再用 visualViewport 和 rem/vw 组合避免 100vh 等常见坑。复杂动效要评估低端机帧率预算。",
      },
      {
        title: "小程序工程实践",
        summary: "理解双线程、setData 粒度与宿主 API 差异。",
        body:
          "View / Logic / Service / Bridge 四层职责要清晰：渲染层控展示，逻辑层控状态，服务端聚合敏感能力，Native Bridge 承接支付、扫码等开放能力。跨宿主（微信 / 支付宝 / 抖音）要预留 API 适配层。",
      },
      {
        title: "桌面端与混合壳",
        summary: "Electron、Tauri、Capacitor 各有包体、性能与系统能力权衡。",
        body:
          "内部工具可接受 Electron 的 Chromium 体积；对包体敏感选 Tauri + 系统 WebView；已有 Web 团队扩桌面/商店分发可看 Capacitor。自动更新、代码签名与商店审核要提前纳入方案。",
      },
    ],
  },
  {
    slug: "ai-automation",
    title: "AI 应用与自动化工程",
    strapline: "把知识与流程交给系统复用",
    summary:
      "关注 AI 对研发流程、知识管理、代码生成和效率提升的真实价值，而不是停留在表层演示。",
    overview:
      "AI 对工程团队最大的价值，不只是生成几段代码，而是帮助我们建立知识复用、流程自动化和问题诊断的新方式。真正关键的是把它融入日常工作流。",
    icon: "sparkles",
    expertiseLevel: "Prompt Workflow / Knowledge System / Automation",
    highlights: ["知识沉淀体系", "Prompt 与工作流设计", "AI 辅助工程实践"],
    principles: [
      "AI 产出必须纳入工程约束和质量校验，而不是直接相信。",
      "有价值的自动化，应该减少重复劳动并保留可追溯性。",
      "真正亮眼的点不是用了 AI，而是把 AI 用进了稳定流程里。",
    ],
    topics: [
      {
        title: "知识资产化",
        summary: "把个人经验转成结构化、可搜索、可复用的内容。",
        body:
          "我会把零散经验尽量沉淀成体系化内容，再通过网站、数据库和可扩展结构长期维护。这样很多原本只存在于脑子里的判断，会慢慢变成能被复用的资产。",
      },
      {
        title: "AI 辅助研发流程",
        summary: "把脚手架、规范、文档和代码生成串起来。",
        body:
          "我会关注 AI 在几个节点的落地价值：需求分析、技术方案、代码骨架、文档生成、问题排查和回归验证。关键不是单点提效，而是形成闭环。",
      },
      {
        title: "对外展示的技术表达",
        summary: "把结果、判断和方法放在一起表达。",
        body:
          "我更希望这个站点展示的是我的工作方式，而不只是几个结果截图。架构思考、工程能力、内容深度和表达方式放在一起，才更接近我平时真正的工作状态。",
      },
    ],
  },
  {
    slug: "leadership-collaboration",
    title: "团队协作与技术影响力",
    strapline: "让个人能力能放大成团队能力",
    summary:
      "重视跨角色沟通、方案表达、复盘沉淀与技术共识建设，让技术决策更容易被理解和复用。",
    overview:
      "我越来越在意复杂场景里的判断和协同能力。把技术问题说清楚、把方案推进下去、把经验复盘成组织资产，这些事情会比一次漂亮的实现更长期地发挥作用。",
    icon: "users",
    expertiseLevel: "Collaboration / Mentoring / Technical Writing",
    highlights: ["方案表达", "跨团队协作", "知识输出与复盘"],
    principles: [
      "我希望技术表达能让不同角色都理解为什么这么做。",
      "协作质量决定了工程方案能否真正落地。",
      "沉淀不是写总结，而是为未来减少重复决策成本。",
    ],
    topics: [
      {
        title: "技术方案表达",
        summary: "把复杂问题拆成可讨论、可评估的决策。",
        body:
          "无论是技术评审还是对外沟通，我都更习惯先回答：**问题是什么、约束是什么、方案如何权衡、为什么这样决策**。这样讨论更容易落到事实和判断，而不是停留在抽象观点上。",
      },
      {
        title: "跨角色协作",
        summary: "理解业务、产品、后端与测试的关注点。",
        body:
          "前端如果能理解上下游的约束，就更容易提出真正可落地的方案。协作能力不是软技能附属品，而是复杂项目成功率的重要组成部分。",
      },
      {
        title: "长期技术影响力",
        summary: "通过文档、规则、模板和案例形成持续影响。",
        body:
          "相比一次性解决问题，我更重视把经验沉淀为可以重复使用的资产，比如规则、模板、知识库和案例库。这些内容会随着时间不断复利。",
      },
    ],
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "enterprise-platform-upgrade",
    title: "企业级中后台体验与架构升级",
    summary:
      "围绕页面复杂度上升、组件重复和协作成本增加的问题，逐步建立统一的布局、状态和组件抽象方式。",
    context:
      "当项目从单页交付走向系统化协作时，真正的挑战往往不是功能本身，而是结构失控、认知不一致和迭代风险上升。",
    impact:
      "通过统一设计语义、拆分可复用模块与建立约束机制，系统的可维护性与后续迭代效率都会显著提升。",
    stack: ["Next.js", "TypeScript", "Design System", "SSR"],
    proofLines: [
      "布局 / 状态 / 组件三层边界写进规范",
      "新页面接入走统一 shell，不再复制粘贴",
      "设计 token + 业务组件分层，减少样式分叉",
    ],
  },
  {
    slug: "performance-governance",
    title: "H5 / 内容站性能治理实践",
    summary:
      "从首屏加载、图片资源、第三方脚本和交互细节入手，建立面向真实用户体验的优化思路。",
    context:
      "性能问题通常不是单点造成的，而是渲染链路、资源策略与监控手段共同作用的结果，需要整体治理而不是碎片化修修补补。",
    impact:
      "通过建立基线指标、优化关键路径并补齐监控，性能优化能从一次性动作升级为长期治理体系。",
    stack: ["Web Vitals", "Performance", "Monitoring", "User Experience"],
    proofLines: [
      "首屏 / 资源 / 第三方脚本分 lane 排查",
      "LCP、INP 基线 + 场景埋点进复盘",
      "问题信号 → 优先级排序，而不是散点 patch",
    ],
  },
  {
    slug: "ai-engineering-workflow",
    title: "AI 驱动的知识沉淀与研发辅助",
    summary:
      "把技术经验、规范模板和内容生产串成一套可迭代工作流，提升输出质量与复用效率。",
    context:
      "AI 的真正价值在于增强工程师的思考、沉淀和组织能力，而不是只做表层代码补全。",
    impact:
      "当知识被结构化、流程被模板化、验证被自动化后，个人和团队都能更稳定地放大产出。",
    stack: ["Prompt Workflow", "Automation", "Knowledge Base", "LLM"],
    proofLines: [
      "笔记入库 → 检索 → /api/chat 引用回答",
      "Prompt / 校验 / 沉淀分阶段，可切换能力组合",
      "本仓库即该工作流的运行实例",
    ],
  },
  {
    slug: "cross-platform-delivery",
    title: "大前端多端同构与发布治理",
    summary:
      "在 H5、小程序与桌面壳之间复用业务模型与 BFF，按端补齐视口、Bridge 与包体策略。",
    context:
      "多端项目最容易失控的是「每个端各写一套」：接口分叉、设计稿不一致、发布节奏不同步，长期维护成本会指数上升。",
    impact:
      "通过能力矩阵、共享类型与分层壳，团队可以在保留端特性的同时控制重复劳动和回归范围。",
    stack: ["H5", "Mini Program", "Taro / uni-app", "Electron", "Tauri"],
    proofLines: [
      "移动端：viewport / safe-area / 触控热区有检查清单",
      "小程序：View-Logic-Service-Bridge 分层 + 分包预下载",
      "桌面：Electron vs Tauri 按包体与系统能力选型",
    ],
  },
];
