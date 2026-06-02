import Link from "next/link";
import { ArrowRight, BrainCircuit, Cpu, MessagesSquare } from "lucide-react";

import { FrontIntelligenceComposerDemo } from "@/components/demos/front-intelligence-composer-demo";
import type { DashboardData } from "@/lib/dashboard-service";

const stacks = [
  {
    icon: BrainCircuit,
    title: "意图识别",
    detail: "架构 / 性能 / 排查 / 流程 / 实现五类意图打分",
  },
  {
    icon: MessagesSquare,
    title: "Prompt 编排",
    detail: "按风格与深度自动补全约束与验收模板",
  },
  {
    icon: Cpu,
    title: "端侧 + 云端",
    detail: "浏览器规则引擎 + Ollama 笔记增强对话",
  },
] as const;

export function FrontIntelligenceSpotlight({
  dashboard,
  llmLabel,
}: {
  dashboard: DashboardData;
  llmLabel: string;
}) {
  const { intelligence } = dashboard;

  return (
    <div className="grid gap-6 rounded-4xl border border-violet-300/15 bg-gradient-to-br from-violet-400/10 via-slate-950/85 to-slate-950/90 p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/85">
            Front Intelligence
          </p>
          <h3 className="text-2xl font-semibold text-white">前端智能化编排台</h3>
          <p className="text-sm leading-7 text-slate-400">
            在浏览器内完成意图识别与 Prompt 改写，再一键带入 Assistant 做笔记增强对话。
            登录 admin 后偏好与学习画像可同步到 `/api/intelligence/profile`。
          </p>

          <div className="grid gap-2">
            {stacks.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-200" />
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {intelligence.features.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-slate-300 transition hover:border-violet-300/30 hover:text-white"
              >
                {feature.label}
              </Link>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            LLM：{intelligence.llmConfigured ? llmLabel : "未配置（仅规则编排可用）"}
          </p>

          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100"
          >
            打开 AI 工作台
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
          <FrontIntelligenceComposerDemo
            samplePrompts={intelligence.samplePrompts}
            llmLabel={llmLabel}
          />
        </div>
      </div>
    </div>
  );
}
