import { HOME_AGENT_AGENTS_URL, KNOWLEDGE_STUDIO_URL } from "@/lib/external-projects";
import type { IntentLabel } from "@/lib/front-intelligence";

export type AssistantContextLink = {
  href: string;
  label: string;
};

export function buildAssistantContextLinks(
  intents: Array<{ label: IntentLabel; score: number }>,
): AssistantContextLink[] {
  const labels = new Set(intents.map((item) => item.label));
  const links: AssistantContextLink[] = [];

  if (labels.has("architecture")) {
    links.push({ href: "/?lab=architecture#demo-lab", label: "架构决策台" });
  }
  if (labels.has("performance")) {
    links.push({ href: "/?lab=performance#demo-lab", label: "性能治理台" });
  }
  if (labels.has("workflow")) {
    links.push(
      { href: "/release-center", label: "发布中心" },
      { href: "/?lab=workflow#demo-lab", label: "AI 工作流台" },
    );
  }
  if (labels.has("debug")) {
    links.push({ href: "/status", label: "运行时诊断" });
  }
  if (labels.has("implementation")) {
    links.push({
      href: HOME_AGENT_AGENTS_URL,
      label: "Agent 工具循环",
    });
  }

  links.push({ href: KNOWLEDGE_STUDIO_URL, label: "笔记库检索" });

  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) {
      return false;
    }
    seen.add(link.href);
    return true;
  }).slice(0, 5);
}
