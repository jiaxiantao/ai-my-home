export type ArchitectureScenario = {
  id: string;
  title: string;
  summary: string;
  signals: string[];
  decisions: {
    rendering: string;
    state: string;
    data: string;
    delivery: string;
  };
  outputs: string[];
};

export type PerformanceLaneId =
  | "resource"
  | "render"
  | "state"
  | "monitoring";

export type PerformanceLane = {
  id: PerformanceLaneId;
  title: string;
  summary: string;
  actions: string[];
};

export type PerformanceSignal = {
  id: string;
  label: string;
  summary: string;
  weights: Record<PerformanceLaneId, number>;
};

export type PerformanceContext = {
  id: string;
  title: string;
  summary: string;
  modifier: Partial<Record<PerformanceLaneId, number>>;
};

export type WorkflowCapability = {
  id: string;
  label: string;
  summary: string;
  impact: number;
};

export type WorkflowStage = {
  id: string;
  title: string;
  summary: string;
};

export type BlueprintAxisId =
  | "rendering"
  | "state"
  | "data"
  | "quality"
  | "delivery";

export type BlueprintConstraint = {
  id: string;
  label: string;
  summary: string;
  weights: Record<BlueprintAxisId, number>;
};

export type BlueprintMode = {
  id: string;
  title: string;
  summary: string;
  modifier: Partial<Record<BlueprintAxisId, number>>;
};

export type BlueprintRecommendation = {
  id: string;
  axis: BlueprintAxisId;
  title: string;
  summary: string;
  detail: string;
  scoreBase: number;
  boosts: string[];
};

export const architectureScenarios: ArchitectureScenario[] = [
  {
    id: "content-platform",
    title: "内容型知识站",
    summary: "兼顾 SEO、结构化内容、多入口复用和长期内容沉淀。",
    signals: ["SEO 首屏可见", "结构化输出", "内容会持续增长"],
    decisions: {
      rendering: "服务端优先，客户端只承担局部交互增强。",
      state: "把筛选、搜索、局部展开留在客户端，主体内容与聚合数据走服务端。",
      data: "先建结构化 schema，再让页面和 API 复用同一份内容模型。",
      delivery: "把详情页、列表页、JSON API、OG 资源一起设计，避免后补。",
    },
    outputs: ["SSR / SSG 边界清晰", "内容结构稳定", "后续接 CMS 或后台录入更自然"],
  },
  {
    id: "admin-workbench",
    title: "复杂中后台工作台",
    summary: "更关注模块边界、权限、状态一致性和协作成本。",
    signals: ["复杂表单与列表", "多人维护", "频繁迭代"],
    decisions: {
      rendering: "首屏骨架可服务端输出，核心交互模块放客户端承接。",
      state: "先拆业务域状态，再决定是不是需要额外状态库，不先引入重型方案。",
      data: "接口会按模块边界和权限语义组织，而不是直接暴露底层表结构。",
      delivery: "组件抽象、目录规则、回归清单要和功能一起落地。",
    },
    outputs: ["状态更新更可控", "复杂模块更易复用", "多人协作认知更统一"],
  },
  {
    id: "ai-ops-system",
    title: "AI 辅助研发系统",
    summary: "重点不是单次生成，而是让知识、规则和验证形成闭环。",
    signals: ["规则很多", "结果要可追溯", "需要人工 review"],
    decisions: {
      rendering: "展示层轻量化，真正的价值在工作流编排和结果回流。",
      state: "把当前步骤、输入上下文、校验状态拆开管理，避免一坨全局状态。",
      data: "让 prompt、规则、知识片段和生成结果都能结构化存储与检索。",
      delivery: "必须带 lint、typecheck、review 或审批等校验环节，不让 AI 直接裸奔。",
    },
    outputs: ["知识资产化", "工作流可复盘", "AI 结果更稳定可控"],
  },
  {
    id: "multi-end-product",
    title: "大前端多端产品",
    summary: "H5、小程序与桌面共享业务模型，按端补齐运行时与发布策略。",
    signals: ["至少两个终端", "接口与 UI 易分叉", "各端发布节奏不同"],
    decisions: {
      rendering: "H5 与服务端首屏协同；小程序按 View/Logic 分层；桌面用 WebView 壳承载核心 Web。",
      state: "共享领域模型与 API 类型，端内状态各自收敛，避免把 DOM 状态跨端硬搬。",
      data: "BFF 聚合 + 统一错误码；敏感能力走 Service，不塞进小程序逻辑层。",
      delivery: "能力矩阵 + 降级清单；各端独立回归用例，共享核心链路冒烟。",
    },
    outputs: ["端差异有文档", "同构边界清晰", "发布与包体策略可核对"],
  },
];

export const performanceLanes: PerformanceLane[] = [
  {
    id: "resource",
    title: "资源链路",
    summary: "我会先确认图片、字体、第三方脚本和首屏阻塞资源。",
    actions: ["压缩关键资源体积", "延后非关键脚本", "减少首屏阻塞请求"],
  },
  {
    id: "render",
    title: "渲染路径",
    summary: "再判断是否有过重客户端渲染、低效列表和无效重渲染。",
    actions: ["收缩客户端边界", "减少重复渲染", "按场景使用虚拟列表或延迟渲染"],
  },
  {
    id: "state",
    title: "状态更新",
    summary: "复杂页面经常不是慢在网络，而是慢在状态粒度和交互节奏。",
    actions: ["按业务域拆状态", "避免一处更新拖全页", "控制高频交互的更新范围"],
  },
  {
    id: "monitoring",
    title: "监控回归",
    summary: "最后把问题放回指标、埋点和回归闭环里，而不是只修一次。",
    actions: ["建立基线指标", "补齐问题场景埋点", "把优化结果回到监控和复盘里"],
  },
];

export const performanceSignals: PerformanceSignal[] = [
  {
    id: "slow-first-screen",
    label: "首屏慢",
    summary: "用户点进来很久才看到真正内容。",
    weights: {
      resource: 4,
      render: 3,
      state: 1,
      monitoring: 1,
    },
  },
  {
    id: "janky-list",
    label: "列表卡顿",
    summary: "滚动、筛选、展开详情时会明显掉帧。",
    weights: {
      resource: 1,
      render: 4,
      state: 4,
      monitoring: 1,
    },
  },
  {
    id: "third-party-drag",
    label: "第三方脚本拖累",
    summary: "埋点、客服、营销脚本压住主线程或阻塞加载。",
    weights: {
      resource: 4,
      render: 2,
      state: 1,
      monitoring: 2,
    },
  },
  {
    id: "unstable-online",
    label: "线上偶发异常",
    summary: "用户反馈慢或报错，但本地和测试不容易稳定复现。",
    weights: {
      resource: 1,
      render: 1,
      state: 2,
      monitoring: 5,
    },
  },
];

export const performanceContexts: PerformanceContext[] = [
  {
    id: "content-site",
    title: "内容站 / 官网",
    summary: "更看重首屏可见、SEO 和第三方脚本治理。",
    modifier: {
      resource: 2,
      render: 1,
    },
  },
  {
    id: "admin-panel",
    title: "中后台工作台",
    summary: "更看重列表交互、复杂状态和异常回归能力。",
    modifier: {
      render: 2,
      state: 2,
      monitoring: 1,
    },
  },
  {
    id: "ai-console",
    title: "AI / 数据工作流台",
    summary: "更看重长链路状态、异步反馈和问题可追踪。",
    modifier: {
      state: 2,
      monitoring: 2,
    },
  },
];

export const workflowCapabilities: WorkflowCapability[] = [
  {
    id: "rules",
    label: "规则约束",
    summary: "把风格、目录、边界和禁止事项交给系统约束。",
    impact: 24,
  },
  {
    id: "knowledge",
    label: "知识上下文",
    summary: "让 AI 看懂项目结构、文档、案例和已有内容。",
    impact: 26,
  },
  {
    id: "validation",
    label: "自动校验",
    summary: "把 lint、typecheck、build 和测试挂在产出后面。",
    impact: 28,
  },
  {
    id: "review",
    label: "人工复核",
    summary: "保留关键判断的人工 review，而不是完全放权。",
    impact: 22,
  },
];

export const workflowStages: WorkflowStage[] = [
  {
    id: "context",
    title: "注入上下文",
    summary: "把规则、文档、内容资产和目标边界一起交给系统。",
  },
  {
    id: "generation",
    title: "生成与拆解",
    summary: "让 AI 先做结构化拆解，而不是直接输出一大段结果。",
  },
  {
    id: "validation",
    title: "校验与回归",
    summary: "结果必须进入自动校验链路，不能只看表面可运行。",
  },
  {
    id: "asset",
    title: "沉淀资产",
    summary: "把好结果回流到模板、知识库和案例库里形成复利。",
  },
];

export const blueprintConstraints: BlueprintConstraint[] = [
  {
    id: "seo",
    label: "SEO / 首屏要求高",
    summary: "页面需要优先被看见、被抓取、被分享。",
    weights: {
      rendering: 5,
      state: 1,
      data: 2,
      quality: 1,
      delivery: 1,
    },
  },
  {
    id: "complex-interaction",
    label: "复杂交互很多",
    summary: "列表、筛选、面板、弹层、拖拽或流程编排较多。",
    weights: {
      rendering: 1,
      state: 5,
      data: 2,
      quality: 2,
      delivery: 1,
    },
  },
  {
    id: "team-collab",
    label: "多人协作维护",
    summary: "需要统一约束、减少认知差异和 review 成本。",
    weights: {
      rendering: 1,
      state: 2,
      data: 2,
      quality: 5,
      delivery: 4,
    },
  },
  {
    id: "content-heavy",
    label: "内容与知识沉淀",
    summary: "内容会持续积累，并复用到不同页面或 API 中。",
    weights: {
      rendering: 3,
      state: 1,
      data: 5,
      quality: 2,
      delivery: 2,
    },
  },
  {
    id: "performance",
    label: "性能和稳定性敏感",
    summary: "首屏、渲染、监控和回归都要更严谨。",
    weights: {
      rendering: 3,
      state: 3,
      data: 1,
      quality: 4,
      delivery: 2,
    },
  },
  {
    id: "ai-workflow",
    label: "希望引入 AI 工作流",
    summary: "需要规则、知识库、自动校验和结果回流能力。",
    weights: {
      rendering: 1,
      state: 2,
      data: 4,
      quality: 4,
      delivery: 4,
    },
  },
];

export const blueprintModes: BlueprintMode[] = [
  {
    id: "mvp",
    title: "MVP 快速落地",
    summary: "优先把主线跑通，但不希望后面完全推倒重来。",
    modifier: {
      delivery: 2,
      quality: 1,
    },
  },
  {
    id: "growth",
    title: "持续增长阶段",
    summary: "已经不是单点页面，需要开始考虑复用、扩展和协作。",
    modifier: {
      data: 2,
      state: 1,
      quality: 2,
    },
  },
  {
    id: "governance",
    title: "治理与长期维护",
    summary: "更在意边界清晰、规范落地和长期可演进性。",
    modifier: {
      quality: 3,
      delivery: 2,
      data: 1,
    },
  },
];

export const blueprintRecommendations: BlueprintRecommendation[] = [
  {
    id: "server-first-rendering",
    axis: "rendering",
    title: "服务端优先 + 客户端局部增强",
    summary: "先把可见内容放在服务端，客户端只承接必要交互。",
    detail: "适合内容站、SEO 页面和对首屏要求高的系统，也更容易把结构化内容复用到页面与 API。",
    scoreBase: 2,
    boosts: ["seo", "content-heavy", "performance"],
  },
  {
    id: "client-workbench-rendering",
    axis: "rendering",
    title: "工作台式客户端承接",
    summary: "首屏骨架可服务端输出，但复杂交互模块集中在客户端。",
    detail: "适合中后台、复杂工作流台和高频交互场景，核心是把交互密度高的区域切清楚。",
    scoreBase: 2,
    boosts: ["complex-interaction", "team-collab"],
  },
  {
    id: "domain-state-splitting",
    axis: "state",
    title: "按业务域拆状态",
    summary: "先拆边界，再决定是否需要额外状态库。",
    detail: "比直接引入统一全局状态更稳，特别适合复杂表单、列表和多面板联动场景。",
    scoreBase: 2,
    boosts: ["complex-interaction", "performance", "team-collab"],
  },
  {
    id: "lightweight-local-state",
    axis: "state",
    title: "局部状态优先",
    summary: "把状态尽量留在离交互更近的地方，避免过早上重型方案。",
    detail: "适合内容型页面、MVP 阶段和状态复杂度还没真正扩张起来的项目。",
    scoreBase: 2,
    boosts: ["seo", "content-heavy"],
  },
  {
    id: "structured-data-model",
    axis: "data",
    title: "先建结构化内容 / 业务模型",
    summary: "把内容、实体关系和复用边界先设计出来。",
    detail: "适合内容站、知识库、AI 工作流或需要多出口复用的系统。",
    scoreBase: 2,
    boosts: ["content-heavy", "ai-workflow", "team-collab"],
  },
  {
    id: "bff-oriented-data",
    axis: "data",
    title: "按场景聚合的 BFF / 页面接口",
    summary: "让接口服务页面与业务模型，而不是直接暴露底层表结构。",
    detail: "适合复杂中后台、工作台和需要聚合多个数据源的系统。",
    scoreBase: 2,
    boosts: ["complex-interaction", "performance"],
  },
  {
    id: "strict-quality-gates",
    axis: "quality",
    title: "把 lint / typecheck / build 变成默认门槛",
    summary: "让质量靠系统默认行为发生，不靠人肉兜底。",
    detail: "适合多人协作、AI 工作流和任何长期维护型项目。",
    scoreBase: 3,
    boosts: ["team-collab", "performance", "ai-workflow"],
  },
  {
    id: "observability-first",
    axis: "quality",
    title: "可观测性前置",
    summary: "让性能、异常和链路回归都能被追踪和复盘。",
    detail: "适合复杂交互、高性能要求或线上问题不稳定的项目。",
    scoreBase: 2,
    boosts: ["performance", "complex-interaction"],
  },
  {
    id: "template-driven-delivery",
    axis: "delivery",
    title: "模板化启动 + 渐进式治理",
    summary: "先把目录、脚本、环境和质量门槛打包成默认起点。",
    detail: "适合新项目快速起步，同时为后面的扩展和治理保留空间。",
    scoreBase: 2,
    boosts: ["team-collab", "ai-workflow"],
  },
  {
    id: "workflow-asset-loop",
    axis: "delivery",
    title: "知识资产回流流程",
    summary: "把案例、规则、笔记和生成结果持续回流到系统里。",
    detail: "适合知识沉淀型项目和 AI 辅助研发系统，能让内容越做越值钱。",
    scoreBase: 2,
    boosts: ["content-heavy", "ai-workflow"],
  },
];
