export type CareerStage = {
  slug: string;
  period: string;
  title: string;
  summary: string;
  focus: string[];
  achievements: string[];
};

export type InterviewHighlight = {
  slug: string;
  title: string;
  summary: string;
  labels: string[];
  challenge: string;
  approach: string[];
  output: string[];
  takeaway: string;
};

export type Playbook = {
  slug: string;
  title: string;
  summary: string;
  scenario: string;
  signals: string[];
  phases: Array<{
    title: string;
    description: string;
  }>;
  deliverables: string[];
};

export type TechStackGroup = {
  title: string;
  summary: string;
  items: string[];
};

export type ResumeDimension = {
  title: string;
  summary: string;
  bullets: string[];
};

export type ArtifactLink = {
  title: string;
  href: string;
  summary: string;
  label: string;
};

export type WorkingNote = {
  title: string;
  summary: string;
  bullets: string[];
};

export const careerTimeline: CareerStage[] = [
  {
    slug: "foundation",
    period: "第 1 - 2 年",
    title: "从页面交付走向工程基本盘",
    summary:
      "早期重点是快速理解业务、稳定完成交付，同时建立对组件复用、接口联调、问题排查和发布流程的完整认知。",
    focus: ["复杂业务页面交付", "组件抽象意识", "联调与问题定位"],
    achievements: [
      "能从需求到上线完整负责单个功能模块，而不只是实现页面。",
      "开始形成对目录结构、公共组件和可维护代码的敏感度。",
      "逐步从“按需求写代码”过渡到“按长期维护组织代码”。",
    ],
  },
  {
    slug: "ownership",
    period: "第 2 - 4 年",
    title: "开始负责模块稳定性与体验质量",
    summary:
      "随着负责范围扩大，关注点从功能完成转向模块一致性、性能体验和协作成本，开始承担更强的 owner 角色。",
    focus: ["模块级架构", "性能优化", "问题复盘与治理"],
    achievements: [
      "能独立推进复杂页面或专题的设计、实现和回归验证。",
      "逐步积累对中后台、H5、内容站等不同类型项目的治理经验。",
      "形成了对首屏性能、渲染边界与异常定位的系统判断。",
    ],
  },
  {
    slug: "system",
    period: "第 4 - 5 年",
    title: "进入工程化与系统化建设阶段",
    summary:
      "开始把经验沉淀为规则、模板、脚手架和协作流程，提升的不再只是个人产出，而是团队整体交付质量。",
    focus: ["研发效能", "流程约束", "团队可复用资产"],
    achievements: [
      "能从现有项目中识别重复问题，并用工具或规范把它们消除掉。",
      "对技术选型开始具备成本、收益和演进路径的综合判断。",
      "更关注如何减少团队认知负担，而不是只优化局部写法。",
    ],
  },
  {
    slug: "leverage",
    period: "第 5 - 6 年+",
    title: "把技术判断力扩展到全链路与 AI 工作流",
    summary:
      "当前更关注系统级设计、全栈协作、知识沉淀与 AI 辅助工程，把个人经验逐步产品化、资产化和流程化。",
    focus: ["系统设计", "全栈协作", "AI workflow 与知识资产化"],
    achievements: [
      "站点本身就是一个知识资产平台，而不是单次面试作品。",
      "能从工程、内容、交互和部署多个层面一起设计技术展示方式。",
      "关注如何把方法论沉淀为长期复利，而不只是堆砌技术关键词。",
    ],
  },
];

export const interviewHighlights: InterviewHighlight[] = [
  {
    slug: "architecture-ownership",
    title: "复杂系统的前端架构判断",
    summary: "我会先看边界、抽象和长期维护成本，而不是先从页面层面堆实现。",
    labels: ["Architecture", "Design System", "SSR"],
    challenge:
      "当业务不断膨胀、页面数量增加、状态逻辑变复杂时，前端容易陷入目录混乱、组件失控和认知不一致的问题。",
    approach: [
      "先识别业务模型和信息架构，再决定组件分层与状态边界。",
      "把页面抽象、设计 token、基础组件和业务组件拆成不同层级治理。",
      "明确哪些内容适合服务端渲染，哪些交互必须放在客户端。",
    ],
    output: [
      "形成可持续扩展的组件体系与页面结构。",
      "让页面交付速度和长期维护性都不至于失衡。",
      "把架构讨论从“喜好”变成“约束与权衡”的工程问题。",
    ],
    takeaway:
      "对我来说，架构判断的核心是让复杂度继续上升时，系统依然保持清晰和可控。",
  },
  {
    slug: "engineering-governance",
    title: "工程效能与质量门槛建设",
    summary: "我更愿意把重复问题沉淀成规则、流程和自动化，而不是一遍遍靠人去兜底。",
    labels: ["CI", "Lint", "DX"],
    challenge:
      "很多团队的问题不是技术不会，而是重复犯错、协作不一致、低级问题流入测试或线上。",
    approach: [
      "通过 ESLint、TypeScript、提交规范、脚手架和模板统一基本质量门槛。",
      "在项目结构、命名、环境配置和变更说明上建立清晰约束。",
      "优先自动化那些重复且高频的人肉流程。",
    ],
    output: [
      "降低 review 成本和低级错误泄漏率。",
      "让新项目启动成本和团队对齐成本更低。",
      "把质量从“依赖某个同学”变成“系统默认行为”。",
    ],
    takeaway:
      "工程化对我来说，不是把流程变重，而是让正确的事情更自然地发生。",
  },
  {
    slug: "performance-governance",
    title: "性能与体验治理能力",
    summary: "我会把性能放在体验、监控和回归链路里一起看，而不是只追一次性的分数变化。",
    labels: ["Web Vitals", "Monitoring", "UX"],
    challenge:
      "性能问题往往跨越资源、渲染、交互和监控几个层面，单点修补通常治标不治本。",
    approach: [
      "先识别核心链路和高频场景，再找出真正影响用户感知的瓶颈。",
      "建立基线指标、监控埋点和问题复盘机制，避免优化不可验证。",
      "同时关注速度、稳定性、流畅度和体验一致性。",
    ],
    output: [
      "首屏、列表交互、第三方脚本和异常场景都能纳入治理视角。",
      "优化工作从临时专项升级为长期能力建设。",
      "面试中能清晰说出排查顺序、权衡方式和验证方法。",
    ],
    takeaway:
      "性能这件事我更习惯讲链路、权衡和回归，而不是单独列一串优化动作。",
  },
  {
    slug: "ai-workflow",
    title: "AI 时代的研发工作流与知识资产化",
    summary: "我会把 AI 放进稳定、可控、可复用的工程流程里，而不是把它当成一次性的生成工具。",
    labels: ["AI Workflow", "Knowledge Base", "Automation"],
    challenge:
      "如果 AI 只停留在聊天生成代码，结果往往会随着上下文变化快速失真，也很难沉淀成长期优势。",
    approach: [
      "把规范、模板、知识库、技术文档和代码生成串成工作流。",
      "为 AI 产出补上上下文约束、人工校验和结果沉淀机制。",
      "让重复性脑力劳动被工具吸收，把更多精力放到判断和表达上。",
    ],
    output: [
      "形成可迭代的知识资产，而不是一次性对话记录。",
      "提升技术方案、文档编写和代码实现的一致性。",
      "站点本身就能作为 AI + 工程实践的对外样本。",
    ],
    takeaway:
      "我更在意的是 AI 是否真的进入了日常工程体系，而不是它偶尔能不能写出一段漂亮代码。",
  },
];

export const playbooks: Playbook[] = [
  {
    slug: "project-bootstrapping",
    title: "新项目 0 -> 1 启动 Playbook",
    summary: "在需求还不完全稳定时，如何快速搭出可长期演进的项目底座。",
    scenario:
      "适用于新产品、新专题或新的技术展示站，需要同时兼顾交付速度、工程质量和后续扩展空间。",
    signals: ["需求会继续增长", "多人协作", "上线后会持续演进"],
    phases: [
      {
        title: "明确边界与验收目标",
        description:
          "先识别目标用户、核心场景、内容结构与上线节奏，避免技术架构脱离实际需求。",
      },
      {
        title: "搭建基础工程与质量门槛",
        description:
          "补齐目录结构、依赖策略、环境变量、Lint、类型检查、部署脚本和基础 UI 体系。",
      },
      {
        title: "按可扩展结构组织内容与数据",
        description:
          "优先设计信息架构和数据模型，再决定页面拆分，减少后续返工成本。",
      },
    ],
    deliverables: ["脚手架与目录结构", "环境与部署方案", "数据模型与内容组织策略"],
  },
  {
    slug: "legacy-refactor",
    title: "复杂存量系统治理 Playbook",
    summary: "不是一口气重写，而是识别风险、逐步收敛结构和技术债。",
    scenario:
      "适用于业务已上线、功能复杂、多人维护的系统，需要在不影响交付的前提下持续治理。",
    signals: ["组件重复", "状态混乱", "修改成本越来越高"],
    phases: [
      {
        title: "先做问题分层",
        description:
          "区分结构性问题、实现性问题和流程性问题，避免把所有问题都当成“技术栈不行”。",
      },
      {
        title: "找到最值得先治理的切口",
        description:
          "优先处理高频、容易复发且会放大协作成本的问题，比如组件重复、命名混乱和回归风险。",
      },
      {
        title: "通过模板和规则固化成果",
        description:
          "治理完成后，要把经验沉淀成文档、组件、脚手架或规则，否则很容易反弹。",
      },
    ],
    deliverables: ["问题地图", "渐进式改造路径", "规则与复用资产"],
  },
  {
    slug: "performance-debugging",
    title: "性能排查与治理 Playbook",
    summary: "用指标、链路和回归方式做性能，而不是凭感觉调优。",
    scenario:
      "适用于首屏慢、交互卡顿、第三方脚本拖累、用户反馈“感觉慢”但问题不稳定的项目。",
    signals: ["首屏超时", "列表卡顿", "线上偶发异常", "优化结果难复现"],
    phases: [
      {
        title: "建立基线与可观测性",
        description:
          "先确认关键指标、用户路径和环境上下文，没有基线就谈不上有效优化。",
      },
      {
        title: "锁定核心瓶颈",
        description:
          "按资源加载、渲染路径、状态更新、第三方依赖和异常链路几个方向逐一排查。",
      },
      {
        title: "把优化纳入长期治理",
        description:
          "把监控、告警、回归检查和复盘文档补齐，防止问题反复出现。",
      },
    ],
    deliverables: ["性能基线", "排查结论", "优化清单与回归机制"],
  },
  {
    slug: "cross-team-delivery",
    title: "跨团队推进复杂项目 Playbook",
    summary: "复杂项目卡住时，往往卡的不是代码，而是认知差和协作链路。",
    scenario:
      "适用于需要与产品、设计、后端、测试多方协作的复杂项目，尤其在需求变化频繁或角色目标不一致时。",
    signals: ["反复返工", "信息不对称", "方案落地困难", "责任边界模糊"],
    phases: [
      {
        title: "对齐问题定义与目标",
        description:
          "确保各方讨论的是同一个问题，而不是带着不同假设争论不同结论。",
      },
      {
        title: "把方案拆成可决策单元",
        description:
          "将技术方案分成边界、风险、依赖、收益等明确维度，降低沟通门槛。",
      },
      {
        title: "把过程沉淀成共识资产",
        description:
          "把方案说明、决策理由、风险清单和回归项记录下来，避免项目推进只依赖口头同步。",
      },
    ],
    deliverables: ["方案文档", "风险清单", "协作节奏与回归项"],
  },
];

export const techStackGroups: TechStackGroup[] = [
  {
    title: "Framework & Rendering",
    summary: "围绕页面架构、渲染边界与信息组织的核心能力。",
    items: ["React", "Next.js App Router", "SSR / SSG", "Component Architecture", "Design System"],
  },
  {
    title: "Data & Backend Awareness",
    summary: "不把前端能力局限在浏览器中，而是理解数据与服务端协作链路。",
    items: ["Prisma", "PostgreSQL", "API Design", "Caching Strategy", "Docker Deployment"],
  },
  {
    title: "Quality & Delivery",
    summary: "让项目可持续、可维护、可验证的工程化基础设施。",
    items: ["TypeScript", "ESLint", "Project Scaffolding", "CI / Hooks", "Release Workflow"],
  },
  {
    title: "Productivity & Influence",
    summary: "从个人产出走向团队复用和技术影响力。",
    items: ["Technical Writing", "Knowledge Base", "AI-assisted Workflow", "Cross-team Collaboration", "Mentoring Mindset"],
  },
];

export const workingNotes: WorkingNote[] = [
  {
    title: "我在新项目里最先确认的三件事",
    summary: "项目一开始，我通常不会急着写页面，而是先把几个最容易影响后续演进的问题定下来。",
    bullets: [
      "边界和验收标准是什么，哪些内容属于这一轮必须交付。",
      "数据和渲染落在哪一层更合适，哪些内容适合服务端，哪些交互必须留在客户端。",
      "目录结构、质量门槛和部署方式是否足够稳定，能不能支撑后续持续迭代。",
    ],
  },
  {
    title: "我处理复杂页面时的默认顺序",
    summary: "页面越复杂，我越不愿意一上来直接拼组件。我会先把结构和变化路径理清楚，再去决定实现细节。",
    bullets: [
      "先还原业务模型和信息流，而不是先写视觉块。",
      "先判断哪些状态是局部状态，哪些已经接近系统状态。",
      "先看长期维护成本，再决定抽象层级和复用方式。",
    ],
  },
  {
    title: "我把 AI 放进日常工作的方式",
    summary: "我更常做的是把 AI 和知识沉淀、模板、校验流程放在一起，而不是把它当成临时问答工具。",
    bullets: [
      "让 AI 先理解项目结构、规则和已有抽象，再开始产出。",
      "让代码、文档和方案都走同一套约束和验证流程。",
      "把有效结果沉淀成可复用资产，而不是停留在单轮对话里。",
    ],
  },
];

export const resumeDimensions: ResumeDimension[] = [
  {
    title: "技术深度",
    summary: "我会同时解释实现方式、约束条件和不采用其他方案的原因。",
    bullets: [
      "能把框架能力、业务复杂度和长期维护成本一起纳入决策。",
      "关注架构边界、数据模型、性能治理和渲染策略。",
      "对“短期上线”和“长期演进”的平衡有持续判断。",
    ],
  },
  {
    title: "工程成熟度",
    summary: "我会主动把重复问题变成规范、模板和自动化，而不是留到下一次再手工处理。",
    bullets: [
      "强调类型安全、约束机制和默认正确的工程习惯。",
      "能把重复问题抽成规则、脚手架和团队资产。",
      "把质量问题前移，而不是等到测试或线上再补救。",
    ],
  },
  {
    title: "业务与协作理解",
    summary: "我习惯把业务目标、交付风险和跨团队协作放到同一个决策里看。",
    bullets: [
      "善于拆解复杂问题、识别核心约束并组织清晰方案。",
      "能与产品、设计、后端、测试形成高效协作关系。",
      "重视复盘和表达，让经验变成组织可复用的共识。",
    ],
  },
];

export const artifactLinks: ArtifactLink[] = [
  {
    title: "Notes",
    href: "/notes",
    summary: "把笔记直接存进 PostgreSQL，用于长期维护、管理和后续检索。",
    label: "打开笔记库",
  },
  {
    title: "Assistant",
    href: "/assistant",
    summary: "通过模型调用和笔记检索，把内容库变成可对话的入口。",
    label: "打开对话窗口",
  },
  {
    title: "Now",
    href: "/now",
    summary: "记录我当前在做什么、最近在想什么，以及内容是怎么继续长出来的。",
    label: "查看当前状态",
  },
  {
    title: "Experience",
    href: "/experience",
    summary: "把经历按阶段展开，看每一段关注点、职责和结果是怎么变化的。",
    label: "查看经历脉络",
  },
  {
    title: "Insights Library",
    href: "/insights",
    summary: "把我平时积累的判断、方法论和工程洞察整理成长期可维护的文章中心。",
    label: "查看文章中心",
  },
  {
    title: "Resume Snapshot",
    href: "/resume",
    summary: "把我的经历、能力维度、成长路径和内容索引整理成结构化页面。",
    label: "查看简历页",
  },
  {
    title: "Engineering Playbooks",
    href: "/playbooks",
    summary: "把我处理复杂问题时反复使用的路径整理成可点击的 playbook。",
    label: "查看方法论页",
  },
  {
    title: "Profile JSON API",
    href: "/api/profile",
    summary: "通过 API 输出结构化资料，把页面内容和数据层串到一起。",
    label: "打开 JSON",
  },
];
