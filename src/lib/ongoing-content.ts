export type CurrentTrack = {
  slug: string;
  title: string;
  summary: string;
  status: string;
  stack: string[];
  notes: string[];
};

export type WorkLog = {
  date: string;
  title: string;
  summary: string;
  tags: string[];
};

export type ExperienceChapter = {
  slug: string;
  period: string;
  title: string;
  summary: string;
  responsibilities: string[];
  projects: string[];
  outcomes: string[];
};

export const currentTracks: CurrentTrack[] = [
  {
    slug: "content-system",
    title: "把个人站点做成真正可维护的内容系统",
    summary:
      "我现在最投入的一件事，是把站点从展示页继续往内容系统推进，让页面、案例、文章、结构化数据和后续扩展方式始终保持同一套骨架。",
    status: "Active",
    stack: ["Next.js", "App Router", "Prisma", "PostgreSQL"],
    notes: [
      "优先把内容结构设计清楚，再补页面样式和局部交互。",
      "尽量让每一类内容都能通过统一数据源复用到页面和 API 里。",
      "后续无论接后台录入还是 MDX，我都希望现有结构不用重来。",
    ],
  },
  {
    slug: "ai-workflow",
    title: "把 AI 放进更真实的前端 / 全栈工作流",
    summary:
      "我现在更在意的是 AI 和项目结构、规则、文档、验证流程之间的关系，而不是单独追求某次生成效果。",
    status: "Ongoing",
    stack: ["Prompt Workflow", "Content Ops", "Validation"],
    notes: [
      "先给 AI 足够稳定的项目上下文，再谈产出质量。",
      "把模板、规则和内容结构当成长期资产，而不是每次重新描述。",
      "所有生成结果最终都要回到 lint、typecheck、build 和人工判断里。",
    ],
  },
  {
    slug: "case-writing",
    title: "把项目经验写成可以反复复用的案例",
    summary:
      "我在慢慢把以前零散的项目经验重写成问题、约束、决策和结果都更清楚的案例，这样后续对外表达会轻松很多。",
    status: "Editing",
    stack: ["Case Writing", "System Thinking", "Technical Narrative"],
    notes: [
      "我不太想再写流水账式项目描述，更希望把判断过程留下来。",
      "一旦案例结构稳定，后面继续扩展新项目会变得很顺手。",
      "很多平时很难说清楚的工作内容，写成案例之后会更具体。",
    ],
  },
];

export const workLogs: WorkLog[] = [
  {
    date: "2026-05-26",
    title: "把首页从展示口号改成更像工作台的内容结构",
    summary:
      "今天把首页里过于标签化的表达收了一轮，增加了 working notes 和更自然的第一人称内容，让页面更像真实维护中的内容站。",
    tags: ["Homepage", "Content", "Voice"],
  },
  {
    date: "2026-05-25",
    title: "补齐 Insights / Cases 的内容出口",
    summary:
      "把文章中心、案例详情、JSON API 和动态 OG 串起来之后，内容终于不再只是首页上的一组摘要卡片。",
    tags: ["Insights", "Cases", "SEO"],
  },
  {
    date: "2026-05-24",
    title: "把 Prisma 数据层和页面结构接起来",
    summary:
      "这一步主要是为了让内容扩展不至于停留在静态组件里，后续接后台或做结构化输出都能顺着已有模型走。",
    tags: ["Prisma", "Data Model", "Architecture"],
  },
  {
    date: "2026-05-22",
    title: "重新梳理文章和案例的写法",
    summary:
      "把原本偏介绍型的表达改成问题、约束、判断和复盘的结构之后，内容的可读性和复用价值明显更高了。",
    tags: ["Writing", "Case Study", "Narrative"],
  },
  {
    date: "2026-05-20",
    title: "把 AI 工作流从想法变成内容骨架",
    summary:
      "我开始把规则、模板、结构化数据和页面表达放到一起考虑，这样 AI 相关内容就不只是“会用工具”，而是能落到真实工作方式里。",
    tags: ["AI Workflow", "Knowledge Base", "Process"],
  },
];

export const experienceChapters: ExperienceChapter[] = [
  {
    slug: "delivery-foundation",
    period: "前 2 年",
    title: "把页面交付能力和工程基本盘先搭稳",
    summary:
      "这一阶段我主要在大量业务页面和模块交付里建立基本功，也是在这个阶段开始真正理解组件复用、联调、发布和问题排查这些事情是如何连在一起的。",
    responsibilities: [
      "负责页面实现、接口联调和交付验证。",
      "逐步建立对组件复用、目录结构和公共能力的敏感度。",
      "开始把“完成需求”往“组织好代码”方向推进。",
    ],
    projects: [
      "复杂业务页面与中后台模块交付",
      "常见表单、筛选、列表与详情页的抽象",
      "联调、灰度发布与线上问题回溯",
    ],
    outcomes: [
      "建立了更完整的页面交付链路意识。",
      "开始形成对长期维护成本的基础判断。",
    ],
  },
  {
    slug: "module-ownership",
    period: "第 2 - 4 年",
    title: "从功能实现转向模块稳定性和体验治理",
    summary:
      "随着负责范围扩大，我开始更多地看模块一致性、交互体验和协作成本，很多工作也从单点页面实现延伸到了模块 owner 的角色。",
    responsibilities: [
      "承担更复杂模块的方案、实现和回归责任。",
      "开始系统性关注性能、体验细节和可维护性。",
      "在多人协作里推进更统一的实现方式。",
    ],
    projects: [
      "中后台复杂页面结构治理",
      "H5 / 内容站体验与性能优化",
      "模块复盘与通用能力沉淀",
    ],
    outcomes: [
      "对结构、性能和体验之间的关系建立了更成体系的理解。",
      "开始习惯把问题写成方法和规范，而不是停在一次性处理上。",
    ],
  },
  {
    slug: "engineering-systems",
    period: "第 4 - 5 年",
    title: "把经验往规则、模板和工程系统里沉淀",
    summary:
      "这个阶段我开始明显减少“重复性的人肉处理”，更多把精力放到脚手架、规则、模板、流程和协作方式的建设上。",
    responsibilities: [
      "推动规范、目录结构、脚手架和质量门槛建设。",
      "把高频问题整理成团队可复用的工程资产。",
      "在技术选型里开始更系统地看演进路径和维护成本。",
    ],
    projects: [
      "工程化规范与约束体系",
      "项目启动模板和脚手架整理",
      "复杂存量项目的渐进式治理",
    ],
    outcomes: [
      "团队对齐和新项目启动成本明显下降。",
      "很多质量问题开始前移到工程系统里解决。",
    ],
  },
  {
    slug: "fullstack-content-ai",
    period: "近 1 - 2 年",
    title: "把前端、内容系统、全链路协作和 AI 工作流放到一起",
    summary:
      "我现在的工作方式已经不太会把页面、数据、内容沉淀和 AI 工具割裂开来看。很多判断都发生在更完整的系统里。",
    responsibilities: [
      "同时关注页面体验、数据组织和内容扩展方式。",
      "把 AI 辅助能力放进真实的工程与内容工作流。",
      "持续把项目经验写成文章、案例和结构化资料。",
    ],
    projects: [
      "Next.js + Prisma 内容系统",
      "AI 辅助研发与知识沉淀流程",
      "结构化案例和工程文章体系",
    ],
    outcomes: [
      "内容复用率和表达效率明显提高。",
      "很多过去依赖临场发挥的内容，开始变成长期可维护资产。",
    ],
  },
];
