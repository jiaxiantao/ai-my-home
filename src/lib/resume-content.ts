import { EXTERNAL_PROJECTS } from "@/lib/external-projects";

export type ResumeContact = {
  phone: string;
  email: string;
  github: string;
  location: string;
};

export type ResumeEducation = {
  school: string;
  major: string;
  degree: string;
  period: string;
};

export type ResumeExperience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  responsibilities: string[];
  highlights: string[];
};

export type ResumeProject = {
  name: string;
  period: string;
  stack: string[];
  summary: string;
  bullets: string[];
  repoUrl?: string;
  previewUrl?: string;
};

export type ResumeSkillGroup = {
  title: string;
  items: string[];
};

export const resumeContact: ResumeContact = {
  phone: "13166990795",
  email: "1374612574@qq.com",
  github: "https://github.com/jiaxiantao",
  location: "杭州",
};

export const resumeHeadline = {
  name: "贾先涛",
  nameEn: "Xiantao Jia",
  title: "高级前端研发工程师",
  tagline: "前端架构 · 大前端多端 · 工程化与 AI 工作流",
  objective:
    "6 年+ 复杂业务与中后台交付经验，曾任前端 TL。深度参与大搜车大风车、超级 4S 二手车、搜 e 销等多端产品线；同时维护多个 GitHub 开源演示项目。",
};

export const resumeEducation: ResumeEducation = {
  school: "北华大学",
  major: "计算机科学与技术",
  degree: "本科",
  period: "2016.09 — 2020.06",
};

export const FENGCHE_OFFICIAL_URL = "https://fengche.souche.com/index.html";

export const resumeExperiences: ResumeExperience[] = [
  {
    company: "浙江大搜车汽车服务有限公司",
    role: "高级前端研发工程师 · 前端 TL",
    period: "2021.03 — 至今",
    summary:
      "负责大风车、超级 4S 二手车、搜 e 销等核心产品的前端研发，覆盖 Web、App、小程序与 PC；与后端 TL 共同制定技术方案并推动落地。",
    responsibilities: [
      "主导大风车 B 端 SaaS、超级 4S 二手车、搜 e 销的 Web / App / 小程序前端交付与架构演进",
      "担任前端 TL：需求技术方案、研发计划、Code Review、进度与质量把控",
      "基础框架构建与优化：兼容性、性能、核心模块与跨团队基础组件库共建",
      "编写模块与组件文档，组织前端技术分享与经验沉淀",
    ],
    highlights: [
      "能制定可落地的复杂业务技术方案，并推动跨团队协作交付",
      "作为 TL 把控任务拆分、风险与版本节奏，保障业务稳定上线",
      "在 RN + 原生 + 离线 H5 混合架构下沉淀高复用跨端组件",
    ],
  },
  {
    company: "杭州叙简科技股份有限公司",
    role: "前端开发工程师",
    period: "2020.04 — 2021.03",
    summary:
      "负责 Web 与移动端 H5 页面还原、接口联调与性能体验优化，参与项目体系搭建。",
    responsibilities: [
      "根据 UI 设计快速还原 Web / H5 页面，完成 REST API 联调与数据处理",
      "按交互与代码规范自查，保障兼容性与体验一致性",
      "封装高复用通用模块与组件，参与主流前端工程体系建设",
    ],
    highlights: [
      "编写扩展性良好的通用组件，提升复用与交付效率",
      "能独立搭建并持续迭代 Vue / React 项目工程体系",
    ],
  },
];

/** 大搜车业务项目 */
export const resumeBusinessProjects: ResumeProject[] = [
  {
    name: "大风车",
    period: "2023.03 — 至今",
    stack: ["Web", "iOS / Android", "PC 同步助手", "React Native", "离线 H5 · Vue"],
    summary:
      "大搜车旗下二手车 B 端 SaaS，面向独立展厅车商：评估、ERP、CRM、营销平台与报表，覆盖车源全生命周期。",
    bullets: [
      "评估系统：评估中车辆匹配潜在客户，大数据估价与评估师业绩看板",
      "ERP：采购到售后全链路状态节点、多店库存与调货、物料 / 价签 / 检测报告一键打印",
      "CRM：客户需求与车源精准匹配、回访提醒与销售转化跟进",
      "营销平台：车源同步多平台、自有 Web / 微店与 ROI 渠道分析",
      "支持 iOS / Android / PC 多端，与展厅销售、评估等角色协同",
    ],
    previewUrl: FENGCHE_OFFICIAL_URL,
  },
  {
    name: "超级 4S 二手车",
    period: "2022.02 — 至今",
    stack: ["React Native", "原生底座", "离线 H5 · Vue", "混合架构"],
    summary: "大搜车二手车 B 端 / 多端销售与运营场景，混合跨端交付。",
    bullets: [
      "原生底座 + RN 主体 + 离线 H5 的混合研发模式，平衡包体、迭代与体验",
      "研发高级跨端组件：图片裁剪、车辆选择器、通用文件预览等",
      "按需加载、懒加载与预加载；iOS / Android 手势、键盘、下拉加载等兼容治理",
      "观察者、装饰器等模式落地；结合团队与市场做务实跨端选型",
    ],
  },
  {
    name: "搜 e 销",
    period: "2021.09 — 2022.02",
    stack: ["React", "umi", "uni-app / Taro", "Vue", "qiankun", "Vite"],
    summary: "大搜车销售渠道产品，从 0→1 搭建 Web、小程序、H5 多端体系。",
    bullets: [
      "从 0→1 搭建 Web / 小程序 / H5 底层架构与技术选型",
      "Webpack 模块联邦、H5 Vite 构建提速；骨架屏、keep-alive、Service Worker 等优化",
      "微前端（qiankun）拆分；内存与安全治理（CSRF / XSS / 鉴权）",
      "作为前端 TL 制定每期技术方案、研发计划与 Code Review 流程",
    ],
  },
];

/** GitHub 开源项目 */
export const resumeOpenSourceProjects: ResumeProject[] = [
  {
    name: "3d-car-viewing",
    period: "开源 · 持续维护",
    stack: ["Next.js", "React Three Fiber", "Three.js", "GLB 部件识别"],
    summary: "3D 看车交互演示：车型切换、部件交互、场景模式与几何体回退。",
    bullets: [
      "GLB 车门 / 灯光 / 车漆自动识别，加载失败回退内置几何体车模",
      "多机位、环车巡检、截图分享与 URL 状态深链",
      "GitHub Pages 在线预览，独立仓库维护",
    ],
    repoUrl: EXTERNAL_PROJECTS.carShowroom.repoUrl,
    previewUrl: EXTERNAL_PROJECTS.carShowroom.previewUrl,
  },
  {
    name: "home-agent",
    period: "开源 · 持续维护",
    stack: ["Next.js", "SSE", "Agent 工具循环", "Prisma · PostgreSQL"],
    summary: "AI Agent 前端编排学习项目：规划 → 工具调用 → trace 流式输出。",
    bullets: [
      "search_notes / calculate / current_time 工具链与 SSE 事件协议",
      "规则规划器回退，支持 CI 与无 API Key 环境",
      "GitHub Pages 部署，可与本站点 Assistant 能力对照阅读",
    ],
    repoUrl: EXTERNAL_PROJECTS.homeAgent.repoUrl,
    previewUrl: EXTERNAL_PROJECTS.homeAgent.previewUrl,
  },
  {
    name: "ai-my-home",
    period: "开源 · 本站点",
    stack: ["Next.js 16", "Prisma", "PostgreSQL", "LLM", "Three.js"],
    summary: "个人全栈技术站：简历、笔记库、对话、发布中心与工程 Demo。",
    bullets: [
      "BFF 看板、pg_trgm 检索、Assistant grounded 对话",
      "Release Center 发布单与门禁；Docker Compose 本地一键环境",
      "首页即结构化简历 + 可交互能力证明",
    ],
    repoUrl: "https://github.com/jiaxiantao/ai-my-home",
    previewUrl: EXTERNAL_PROJECTS.aiMyHome.previewUrl,
  },
  {
    name: "team-docs",
    period: "开源",
    stack: ["Next.js", "Yjs", "PostgreSQL", "协同编辑"],
    summary: "团队协作文档：类飞书文档体验，支持多人实时协同。",
    bullets: [
      "基于 Yjs 的协同编辑与持久化",
      "Next.js 全栈，PostgreSQL 存储文档与版本",
      "面向团队知识沉淀与协作场景验证",
    ],
    repoUrl: EXTERNAL_PROJECTS.teamDocs.repoUrl,
    previewUrl: EXTERNAL_PROJECTS.teamDocs.previewUrl,
  },
  {
    name: "cos-design",
    period: "开源",
    stack: ["TypeScript", "组件库", "前端工程化"],
    summary: "搜车场景下的前端设计 / 组件探索与实践沉淀。",
    bullets: [
      "可复用 UI 与交互模式整理",
      "TypeScript 工程化与组件规范实践",
    ],
    repoUrl: EXTERNAL_PROJECTS.cosDesign.repoUrl,
    previewUrl: EXTERNAL_PROJECTS.cosDesign.previewUrl,
  },
  {
    name: "3d-express-warehouse",
    period: "开源",
    stack: ["Three.js", "WebGL", "3D 可视化"],
    summary: "3D 快递仓库场景演示，空间布局与交互可视化。",
    bullets: [
      "仓库三维场景搭建与浏览交互",
      "WebGL 性能与展示效果平衡",
    ],
    repoUrl: EXTERNAL_PROJECTS.expressWarehouse.repoUrl,
    previewUrl: EXTERNAL_PROJECTS.expressWarehouse.previewUrl,
  },
];

/** @deprecated 使用 resumeBusinessProjects + resumeOpenSourceProjects */
export const resumeProjects: ResumeProject[] = [
  ...resumeBusinessProjects,
  ...resumeOpenSourceProjects,
];

export const resumeSkillGroups: ResumeSkillGroup[] = [
  {
    title: "基础与语言",
    items: [
      "HTML5 / CSS3 / JavaScript（ES6+）",
      "TypeScript",
      "浏览器原理 · 事件循环 · 异步编程",
      "HTTP · 同源策略 · CSRF / XSS 防护",
    ],
  },
  {
    title: "框架与多端",
    items: [
      "React · Next.js App Router · Vue",
      "React Native · 混合 App",
      "微信小程序 · uni-app · Taro",
      "Ant Design · Element UI · Vant",
    ],
  },
  {
    title: "工程化与质量",
    items: [
      "Webpack · Vite · 模块联邦 · 微前端",
      "ESLint · TypeScript · CI / Docker",
      "组件化 · 设计系统 · Code Review",
      "性能优化 · 体验治理 · 兼容性",
    ],
  },
  {
    title: "全栈与智能化（当前重点）",
    items: [
      "Node.js · Prisma · PostgreSQL",
      "BFF · REST / SSE API 设计",
      "LLM 接入 · RAG · Agent 工具循环",
      "ECharts · Three.js · 数据可视化",
    ],
  },
];

export const resumeSelfEvaluation: string[] = [
  "关注前端与 AI 工程化前沿，熟悉产品从需求到上线的完整流程，能独立承担复杂前端项目并曾担任前端 TL。",
  "大风车业务线（评估 / ERP / CRM 等）与开源项目并行推进，重视可验证的技术表达与长期可维护性。",
  "本站点持续迭代，欢迎结合下方在线 Demo 与开源仓库进一步了解细节。",
];
