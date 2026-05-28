import type { ChatMessage } from "@/lib/chat-types";

type IntentLabel =
  | "architecture"
  | "performance"
  | "debug"
  | "workflow"
  | "implementation";

export type ComposerIntelligence = {
  intents: Array<{ label: IntentLabel; score: number }>;
  rewrittenPrompt: string | null;
  actions: string[];
  followUps: string[];
};

const intentRules: Record<IntentLabel, RegExp> = {
  architecture: /架构|分层|设计|模块|治理|边界|方案/i,
  performance: /性能|慢|优化|卡顿|耗时|ttfb|ttft|fps|vitals/i,
  debug: /报错|错误|异常|失败|崩溃|排查|debug|修复/i,
  workflow: /流程|规范|协作|ci|发布|回归|测试|review/i,
  implementation: /实现|开发|编码|改造|重构|落地|代码/i,
};

function scoreIntents(input: string) {
  const normalized = input.trim();
  if (!normalized) {
    return [];
  }

  const base = Object.entries(intentRules)
    .map(([label, pattern]) => {
      const matched = pattern.test(normalized);
      return matched ? { label: label as IntentLabel, score: 0.72 } : null;
    })
    .filter(Boolean) as Array<{ label: IntentLabel; score: number }>;

  if (!base.length) {
    return [{ label: "implementation" as IntentLabel, score: 0.45 }];
  }

  return base;
}

function rewritePrompt(input: string, intents: Array<{ label: IntentLabel; score: number }>) {
  const normalized = input.trim();
  if (!normalized) {
    return null;
  }

  const hasConstraint = /步骤|风险|指标|优先级|验收|输出格式/.test(normalized);
  if (normalized.length > 25 && hasConstraint) {
    return null;
  }

  const leadingIntent = intents[0]?.label;
  const intentHint =
    leadingIntent === "performance"
      ? "请包含瓶颈定位、可量化指标与优化顺序。"
      : leadingIntent === "architecture"
        ? "请按目标、模块边界、数据流和风险清单来回答。"
        : leadingIntent === "debug"
          ? "请给排查路径、复现方式和最小修复建议。"
          : "请给步骤、风险与验收标准。";

  return `${normalized}\n\n${intentHint}`;
}

function actionHints(intents: Array<{ label: IntentLabel; score: number }>) {
  const labels = intents.map((item) => item.label);
  const actions = new Set<string>();

  actions.add("回答时附上 3 条可执行步骤");
  actions.add("补充风险与回滚方案");

  if (labels.includes("performance")) {
    actions.add("给出 p50/p95 目标与观测方式");
  }
  if (labels.includes("architecture")) {
    actions.add("给出模块边界与依赖图建议");
  }
  if (labels.includes("debug")) {
    actions.add("优先给最小复现和定位路径");
  }

  return [...actions].slice(0, 4);
}

function followUpSuggestions(messages: ChatMessage[]) {
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  if (!lastAssistant?.content.trim()) {
    return [];
  }

  const body = lastAssistant.content;
  const suggestions = new Set<string>();

  if (/性能|耗时|延迟|ms|p95/i.test(body)) {
    suggestions.add("把方案拆成 1 天可完成的优化任务");
  }
  if (/架构|模块|边界|分层/i.test(body)) {
    suggestions.add("请给出该架构的迁移顺序与风险");
  }
  if (/测试|回归|验证|监控/i.test(body)) {
    suggestions.add("补一份可直接执行的验证清单");
  }

  suggestions.add("基于当前回答再给一个低成本版本");
  return [...suggestions].slice(0, 3);
}

export function analyzeComposer(
  input: string,
  messages: ChatMessage[],
): ComposerIntelligence {
  const intents = scoreIntents(input);
  return {
    intents,
    rewrittenPrompt: rewritePrompt(input, intents),
    actions: actionHints(intents),
    followUps: followUpSuggestions(messages),
  };
}
