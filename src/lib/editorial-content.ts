export type InsightArticle = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: string;
  featured?: boolean;
  body: string;
  takeaways: string[];
};

export type CaseStudyDetail = {
  slug: string;
  title: string;
  strapline: string;
  summary: string;
  problem: string;
  constraints: string[];
  decisions: string[];
  execution: string[];
  outcomes: string[];
  lessons: string[];
  relatedDomains: Array<{
    slug: string;
    label: string;
  }>;
};

export type ConversationTopic = {
  title: string;
  summary: string;
  prompts: string[];
};

export const insightArticles: InsightArticle[] = [
  {
    slug: "when-a-frontend-project-needs-governance",
    title: "如何判断一个前端项目已经进入“需要治理”的阶段",
    summary:
      "很多项目不是突然变差，而是在需求膨胀和协作增加时，逐步累积出结构失控、修改成本上升和认知不一致。",
    category: "Architecture",
    tags: ["治理", "架构判断", "前端工程化"],
    publishedAt: "2026-05-26",
    readingTime: "8 min",
    featured: true,
    body:
      "### 我通常怎么判断一个项目是不是开始失控了\n\n我不会靠主观感觉判断，而是先看几个很具体的信号：结构是不是越来越散，改动是不是越来越容易牵一大片，协作是不是越来越依赖某几个人的历史记忆。\n\n### 我通常会看三个维度\n\n1. **结构是否持续退化**：目录混乱、组件职责模糊、改动总要牵一大片。\n2. **协作成本是否显著上升**：同一个问题反复讨论、命名不统一、PR review 变得低效。\n3. **修改风险是否越来越大**：加一个功能需要到处试错，回归范围不断扩大。\n\n### 为什么这个阶段很容易被忽略\n\n因为项目在早期通常还能跑，交付速度也未必立刻下降，所以很多问题会被当成“以后再说”。但一旦规模和人数上来，隐性成本会集中爆发。\n\n### 我通常怎么处理\n\n我不会一上来就说重构，而是先把问题分层：哪些是目录和边界问题，哪些是状态和组件抽象问题，哪些是流程和规范问题。只有先分层，后续治理才不会演变成低效的全面翻修。\n\n### 我想得到的结果\n\n我做治理不是为了让代码显得高级，而是为了让系统在继续增长时仍然可维护、可理解、可协作。",
    takeaways: [
      "治理不是重构冲动，而是对复杂度变化的提前识别。",
      "要先分清结构问题、实现问题和流程问题。",
      "我更在意的是，能不能把局部问题上升成系统判断。",
    ],
  },
  {
    slug: "performance-is-a-governance-topic",
    title: "性能优化不是一次性专项，而是一种治理能力",
    summary:
      "性能问题真正难的部分，不是知道有哪些优化手段，而是知道什么时候查什么、如何验证、如何避免反复出现。",
    category: "Performance",
    tags: ["性能优化", "Web Vitals", "监控"],
    publishedAt: "2026-05-24",
    readingTime: "7 min",
    featured: true,
    body:
      "### 从“调分”到“治理”的转变\n\n很多性能讨论停留在技巧层，比如图片压缩、懒加载、缓存策略。我更关心的是：问题是如何暴露的、影响了谁、是否能稳定复现、优化后如何避免回退。\n\n### 我的排查顺序\n\n- 先确认是否真的是核心链路问题，而不是偶发环境噪音。\n- 再看资源、渲染、状态更新、第三方脚本、异常链路几个维度。\n- 最后才决定是做局部优化，还是补监控和长期治理机制。\n\n### 为什么监控很关键\n\n没有上下文的性能数据，往往只能说明“慢过”，不能说明“为什么慢”。我更倾向把页面、环境、用户路径和错误上下文一起纳入分析。\n\n### 我平时怎么讲性能问题\n\n我不会只罗列优化点，而是更习惯按 **问题现象 -> 排查路径 -> 权衡依据 -> 回归验证** 这个顺序去讲。",
    takeaways: [
      "性能优化要先建立问题基线，再谈手段。",
      "监控和回归机制决定性能优化是否可持续。",
      "好的性能表达方式是链路，不是清单。",
    ],
  },
  {
    slug: "ai-needs-a-real-engineering-workflow",
    title: "AI 要真正有价值，必须进入真实工程工作流",
    summary:
      "真正有说服力的 AI 能力不是会不会写 prompt，而是能不能把规范、上下文、验证和沉淀串成闭环。",
    category: "AI Workflow",
    tags: ["AI", "工作流", "知识沉淀"],
    publishedAt: "2026-05-20",
    readingTime: "9 min",
    featured: true,
    body:
      "### 为什么很多 AI 使用方式看起来厉害但不耐用\n\n因为它们停留在单轮对话层，缺少工程约束、组织记忆和结果校验。一旦上下文变复杂，产出质量就开始波动。\n\n### 我更关注的不是“生成”，而是“融入”\n\n- 如何让 AI 理解项目结构、技术约束和团队规范\n- 如何把常见任务模板化，而不是每次重新描述\n- 如何把结果纳入 lint、typecheck、构建和人工 review\n\n### 我真正看重的变化\n\n当 AI 不再只是辅助写某一段代码，而是开始辅助做需求分析、技术方案、脚手架初始化、文档沉淀和问题排查时，它才真正开始放大我的判断力和组织能力。\n\n### 这件事最终会沉淀成什么\n\n我更希望看到的是知识资产、模板、结构化内容和工程输出之间形成稳定循环，而不是每次都从一轮新对话重新开始。",
    takeaways: [
      "AI 的核心价值是进入流程，不是停留在对话。",
      "规范、上下文和验证机制决定 AI 产出质量。",
      "真正亮眼的是把 AI 用进稳定、可复用的工程体系。",
    ],
  },
  {
    slug: "frontend-engineers-need-backend-awareness",
    title: "为什么我会把服务端与数据视角当作前端工作的延伸",
    summary:
      "当前端只盯着浏览器，很容易在架构判断上失去全局视角；理解数据建模、接口设计和部署链路，会显著提升技术判断力。",
    category: "Full Stack",
    tags: ["Prisma", "PostgreSQL", "服务端渲染"],
    publishedAt: "2026-05-18",
    readingTime: "6 min",
    body:
      "### 为什么我不把前端边界停在页面层\n\n今天的前端已经深度参与数据组织、服务端渲染、缓存策略和部署体验。如果我不了解这些层面的约束，很多技术方案就会天然缺乏整体性。\n\n### 我在意的不是“写后端”，而是“理解全链路”\n\n- 接口为什么要这样设计\n- 页面数据为什么适合在服务端拿还是客户端拿\n- 数据结构是否支持内容扩展和复用\n- 部署和环境配置是否会影响协作效率\n\n### 这会改变我的哪些判断\n\n当我把数据和服务端意识一起放进决策里，页面结构、协作方式和后续演进路径通常都会更稳。",
    takeaways: [
      "全栈视角不是越权，而是增强系统判断力。",
      "理解数据与部署，会显著改善前端架构决策。",
      "我习惯把前端工作放到完整交付链路里一起看。",
    ],
  },
];

export const caseStudyDetails: CaseStudyDetail[] = [
  {
    slug: "enterprise-platform-upgrade",
    title: "企业级中后台体验与架构升级",
    strapline: "从局部功能交付走向系统级治理",
    summary:
      "面对模块增多、组件重复和协作成本上升的中后台系统，我更关注如何让页面结构、组件语义和团队协作一起变得可控。",
    problem:
      "系统在持续迭代后逐步出现结构失控：同类页面实现方式不一致，组件边界混乱，状态逻辑散落，新增需求越来越依赖具体开发者的历史记忆。",
    constraints: [
      "不能停掉业务节奏全面重构。",
      "需要兼顾现有页面稳定性和后续迭代效率。",
      "不同团队成员的代码习惯和理解方式存在差异。",
    ],
    decisions: [
      "先建立页面结构和组件抽象的一致语义，再处理局部实现差异。",
      "把通用布局、筛选区、列表区和详情区拆成可组合模块。",
      "同步补充命名约束、目录规则和评审口径，避免治理成果反弹。",
    ],
    execution: [
      "识别高频重复页面，抽出布局与通用交互模式。",
      "重构基础组件 API，让复用建立在清晰边界而不是复制代码上。",
      "在治理过程中保留业务迭代节奏，用渐进方式替代一次性重构。",
    ],
    outcomes: [
      "页面一致性提升，团队更容易形成共识。",
      "新增模块的启动成本和评审成本下降。",
      "后续需求更容易在已有抽象上扩展，而不是重新拼装。",
    ],
    lessons: [
      "真正影响系统质量的，往往是边界和语义，而不只是代码风格。",
      "治理一定要和团队协作方式一起推进，否则很难持久。",
      "成熟系统更适合渐进式治理，而不是追求一次性理想方案。",
    ],
    relatedDomains: [
      { slug: "frontend-architecture", label: "前端架构与设计系统" },
      { slug: "engineering-efficiency", label: "工程化与研发效能" },
    ],
  },
  {
    slug: "performance-governance",
    title: "H5 / 内容站性能治理实践",
    strapline: "从表层优化走向指标、链路与回归闭环",
    summary:
      "性能问题不止是慢，而是用户感知、业务链路和工程监控之间的综合问题，需要建立长期可追踪的治理方式。",
    problem:
      "页面首屏、资源加载和交互流畅度在不同场景下表现不稳定，用户感知与技术指标之间存在信息断层，优化工作难以长期沉淀。",
    constraints: [
      "问题不总能稳定复现，容易陷入凭经验猜测。",
      "不同页面类型的瓶颈来源并不相同。",
      "优化不能只追求局部分数，而要兼顾体验一致性。",
    ],
    decisions: [
      "先建立问题基线和关键链路，再决定优先级。",
      "把资源、渲染、第三方脚本、异常链路纳入统一排查框架。",
      "把优化结果纳入监控与复盘，而不是做完一次就结束。",
    ],
    execution: [
      "梳理核心页面路径和高频场景，明确指标含义。",
      "拆分性能问题来源，避免不同类型问题互相掩盖。",
      "补充回归视角，让优化不因为新需求再次退化。",
    ],
    outcomes: [
      "排查过程从经验驱动转为链路驱动。",
      "性能讨论更容易对齐到真实业务价值和用户体验。",
      "后续优化不再是孤立动作，而成为持续能力建设的一部分。",
    ],
    lessons: [
      "性能优化不是技巧收藏夹，而是治理体系。",
      "没有上下文的指标，不足以支撑稳定决策。",
      "复盘和回归机制是性能能力成熟的重要标志。",
    ],
    relatedDomains: [
      { slug: "performance-experience", label: "性能优化与体验治理" },
      { slug: "leadership-collaboration", label: "团队协作与技术影响力" },
    ],
  },
  {
    slug: "ai-engineering-workflow",
    title: "AI 驱动的知识沉淀与研发辅助",
    strapline: "把零散经验变成结构化、可复用的工作流",
    summary:
      "重点不在于生成几段代码，而在于如何把上下文、规范、模板和校验机制一起纳入 AI 辅助流程。",
    problem:
      "如果 AI 只作为聊天工具存在，产出质量会严重依赖临时上下文，难以形成稳定复用，也难体现真正工程价值。",
    constraints: [
      "AI 产出质量受上下文完整度影响很大。",
      "没有规则和校验机制时，结果很难长期稳定。",
      "团队需要的是可复用流程，而不是偶发高光时刻。",
    ],
    decisions: [
      "把规范、模板、文档和代码组织方式作为 AI 的固定输入资产。",
      "让 AI 产出始终经过 lint、typecheck、构建和人工 review。",
      "把对话结果沉淀为可重复使用的知识内容和项目结构。",
    ],
    execution: [
      "围绕需求分析、技术方案、页面搭建、内容输出设计工作流。",
      "用结构化站点承接内容沉淀，而不是只保留临时聊天记录。",
      "逐步把重复性认知劳动迁移到模板与系统中。",
    ],
    outcomes: [
      "技术表达更加系统，内容复用率显著提升。",
      "工程输出和知识沉淀形成正向循环。",
      "站点本身成为 AI + 工程化实践的展示样本。",
    ],
    lessons: [
      "AI 真正的亮点在于进入日常流程，而不是一次性展示。",
      "越是复杂场景，越需要规则、结构和验证机制。",
      "把经验资产化，才能让 AI 的价值持续复利。",
    ],
    relatedDomains: [
      { slug: "ai-automation", label: "AI 应用与自动化工程" },
      { slug: "engineering-efficiency", label: "工程化与研发效能" },
    ],
  },
  {
    slug: "cross-platform-delivery",
    title: "大前端多端同构与发布治理",
    strapline: "同一业务模型，按端补齐运行时约束",
    summary:
      "在 H5、小程序与桌面壳之间复用领域模型与 BFF，用能力矩阵和分层壳控制重复劳动与回归范围。",
    problem:
      "多端项目常见问题是各端各写一套：接口分叉、设计不一致、发布节奏不同步，导致维护成本指数上升。",
    constraints: [
      "各端运行时能力不同，不能假设 DOM 或 Node API 处处可用。",
      "小程序有包体、审核与 setData 性能约束。",
      "桌面端要兼顾包体、自动更新与系统 API。",
    ],
    decisions: [
      "先画能力矩阵与降级策略，再选 Taro / uni-app / Electron / Tauri。",
      "BFF 聚合接口，统一错误码；敏感逻辑留在 Service 层。",
      "移动端单独维护 viewport / safe-area 检查清单。",
    ],
    execution: [
      "H5 用 rem / visualViewport 处理键盘与安全区。",
      "小程序按 View-Logic-Service-Bridge 分层，分包预下载核心路径。",
      "桌面按场景在 Electron 与 Tauri 之间选型并落实签名更新链。",
    ],
    outcomes: [
      "核心业务模型与类型在端间复用，差异集中在壳与桥接层。",
      "各端有独立回归用例，共享链路统一冒烟。",
      "首页 #cross-platform 提供可切换的交互 Demo 对齐文档。",
    ],
    lessons: [
      "跨端复用的是契约与模型，不是 DOM API。",
      "发布链路与包体策略要和页面实现一起设计。",
      "先对齐能力边界，再谈框架选型。",
    ],
    relatedDomains: [
      { slug: "cross-platform-frontend", label: "大前端与多端交付" },
      { slug: "frontend-architecture", label: "前端架构与设计系统" },
      { slug: "fullstack-delivery", label: "全栈协作与服务端能力" },
    ],
  },
];

export const conversationTopics: ConversationTopic[] = [
  {
    title: "架构与长期维护",
    summary: "这里我会继续聊边界划分、抽象方式、目录治理和组件体系建设。",
    prompts: [
      "你如何判断一个项目是否需要架构治理？",
      "组件抽象和过度封装的边界怎么把握？",
      "面对存量系统时你会怎么推进而不打断业务？",
    ],
  },
  {
    title: "工程效能与协作",
    summary: "这里我会继续聊规范、模板、团队共识和复杂项目推进方式。",
    prompts: [
      "什么样的规范值得落地，什么样的不值得？",
      "你如何看待脚手架、规则和自动化的边界？",
      "跨团队项目里最容易失控的是什么？",
    ],
  },
  {
    title: "性能与 AI 工作流",
    summary: "这里我会继续聊真实问题排查方式，以及我怎么把 AI 放进工程体系。",
    prompts: [
      "你的性能排查顺序通常是什么？",
      "如何让 AI 产出真正可控，而不是偶尔可用？",
      "为什么我会把知识沉淀放到日常工作里？",
    ],
  },
  {
    title: "大前端与多端交付",
    summary: "移动端 H5、小程序分层、桌面运行时选型与发布治理。",
    prompts: [
      "H5 里 viewport 和 safe-area 你会怎么验收？",
      "小程序 setData 和分包你会怎么规划？",
      "Electron 和 Tauri 你会怎么选型？",
    ],
  },
];

export function getInsightBySlug(slug: string) {
  return insightArticles.find((article) => article.slug === slug) ?? null;
}

export function getCaseStudyDetailBySlug(slug: string) {
  return caseStudyDetails.find((entry) => entry.slug === slug) ?? null;
}
