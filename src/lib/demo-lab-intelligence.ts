import {
  architectureScenarios,
  blueprintConstraints,
  blueprintModes,
  performanceContexts,
  performanceSignals,
  workflowCapabilities,
} from "@/lib/demo-lab-content";
import type { DemoLabUrlState } from "@/lib/demo-lab-url-state";

export function buildDemoLabAnalyzeInput(state: DemoLabUrlState): string {
  switch (state.tab) {
    case "architecture": {
      const scenario =
        architectureScenarios.find((item) => item.id === state.scenario) ??
        architectureScenarios[0];
      return [
        `架构决策场景「${scenario.title}」：${scenario.summary}`,
        `关注点：${scenario.signals.join("、")}`,
        "请给实施步骤、模块边界与主要风险。",
      ].join(" ");
    }
    case "performance": {
      const context =
        performanceContexts.find((item) => item.id === state.context) ??
        performanceContexts[0];
      const signalLabels = performanceSignals
        .filter((item) => state.signals?.includes(item.id))
        .map((item) => item.label);
      return [
        `性能治理上下文「${context.title}」：${context.summary}`,
        `已选信号：${signalLabels.join("、") || "未选择"}`,
        "请给排查 lane 优先级、p95 验收指标与 1 周落地计划。",
      ].join(" ");
    }
    case "workflow": {
      const capabilityLabels = workflowCapabilities
        .filter((item) => state.capabilities?.includes(item.id))
        .map((item) => item.label);
      return [
        `AI 工作流能力组合：${capabilityLabels.join("、") || "默认组合"}`,
        "请评估稳定度、缺失能力与上线前门禁清单。",
      ].join(" ");
    }
    case "blueprint": {
      const mode =
        blueprintModes.find((item) => item.id === state.mode) ?? blueprintModes[0];
      const constraintLabels = blueprintConstraints
        .filter((item) => state.constraints?.includes(item.id))
        .map((item) => item.label);
      return [
        `架构沙盘模式「${mode.title}」`,
        `约束：${constraintLabels.join("、") || "未选择"}`,
        "请给方案建议、迁移顺序与回滚策略。",
      ].join(" ");
    }
    default:
      return "前端工程化决策与性能治理，请给步骤与验收标准。";
  }
}
