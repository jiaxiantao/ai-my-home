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
};

export type ResumeSkillGroup = {
  title: string;
  items: string[];
};

export const resumeContact: ResumeContact = {
  phone: "13166990795",
  email: "jiaxiantao@souche.com",
  github: "https://github.com/jiaxiantao",
  location: "杭州",
};

export const resumeHeadline = {
  name: "贾先涛",
  nameEn: "Xiantao Jia",
  title: "高级前端研发工程师",
  tagline: "前端架构 · 大前端多端 · 工程化与 AI 工作流",
  objective:
    "6 年+ 复杂业务与中后台交付经验，曾任前端 TL。擅长从 0→1 搭建多端技术体系，在性能、体验与工程化之间做可持续权衡；当前聚焦 React/Next 全栈、智能化研发与可验证的技术表达（本站点即在线作品）。",
};

export const resumeEducation: ResumeEducation = {
  school: "北华大学",
  major: "计算机科学与技术",
  degree: "本科",
  period: "2016.09 — 2020.06",
};

export const resumeExperiences: ResumeExperience[] = [
  {
    company: "浙江大搜车汽车服务有限公司",
    role: "高级前端研发工程师 · 前端 TL",
    period: "2021.03 — 至今",
    summary:
      "负责超级 4S 二手车、搜 e 销等核心产品的前端研发，覆盖 Web、App、小程序；与后端 TL 共同制定技术方案并推动落地。",
    responsibilities: [
      "主导超级 4S 二手车、搜 e 销的 Web / App / 小程序前端交付与架构演进",
      "担任前端 TL：需求技术方案、研发计划、Code Review、进度与质量把控",
      "基础框架构建与优化：兼容性、性能、核心模块与跨端组件库共建",
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

export const resumeProjects: ResumeProject[] = [
  {
    name: "超级 4S 二手车",
    period: "2022.02 — 至今",
    stack: ["React Native", "原生底座", "离线 H5 · Vue", "混合架构"],
    summary: "二手车 B 端 / 多端销售与运营场景，混合跨端交付。",
    bullets: [
      "原生底座 + RN 主体 + 离线 H5 的混合研发模式，平衡包体、迭代与体验",
      "研发高级跨端组件：图片裁剪、车辆选择器、通用文件预览等",
      "按需加载、懒加载与预加载；iOS / Android 手势、键盘、下拉加载等兼容治理",
      "观察者、装饰器等模式落地；跨端选型结合团队与市场做务实决策",
    ],
  },
  {
    name: "搜 e 销",
    period: "2021.09 — 2022.02",
    stack: ["React", "umi", "uni-app / Taro", "Vue", "qiankun", "Vite"],
    summary: "从 0→1 搭建 Web、小程序、H5 多端销售体系。",
    bullets: [
      "从 0→1 搭建 Web / 小程序 / H5 底层架构与技术选型",
      "Webpack 模块联邦、H5 Vite 构建提速；骨架屏、keep-alive、Service Worker 等体验与性能优化",
      "微前端（qiankun）拆分；内存与安全治理（CSRF / XSS / 鉴权）",
      "作为前端 TL 制定每期技术方案、研发计划与 Code Review 流程",
    ],
  },
  {
    name: "AI My Home（个人技术站 · 本仓库）",
    period: "2024 — 至今",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Prisma · PostgreSQL",
      "Three.js · ECharts",
      "Ollama / LLM",
    ],
    summary: "可运行的全栈能力展示站：简历、笔记库、对话、发布中心与工程 Demo。",
    bullets: [
      "BFF 聚合看板、笔记 CRUD、pg_trgm 检索与 Assistant  grounded 对话",
      "Release Center 发布单 / 门禁 / 审计；Docker Compose 一键本地环境",
      "端侧 AI（Transformers.js、MediaPipe）、3D 看车与 Agent 编排等独立开源演示",
      "用真实 API、交互与部署替代「堆关键词」式自我介绍",
    ],
  },
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
  "学习适应能力强，善于拆解问题、制定方案并推动跨团队落地；重视文档、复盘与可复用资产。",
  "本站点持续迭代，用于结构化呈现经历、判断与可验证的技术能力，欢迎结合下方在线 Demo 进一步了解。",
];
