"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bot, MessageCircle, Sparkles } from "lucide-react";

import { IntelligenceComposerPreview } from "@/components/intelligence-composer-preview";
import { buildDemoLabAnalyzeInput } from "@/lib/demo-lab-intelligence";
import type { DemoLabUrlState } from "@/lib/demo-lab-url-state";
import { analyzeComposer } from "@/lib/front-intelligence";
import { defaultIntelligencePreferences } from "@/lib/front-intelligence-preferences";

export function DemoLabIntelligenceBridge({ state }: { state: DemoLabUrlState }) {
  const input = useMemo(() => buildDemoLabAnalyzeInput(state), [state]);
  const intelligence = useMemo(
    () => analyzeComposer(input, [], defaultIntelligencePreferences),
    [input],
  );

  const assistantHref = `/assistant?q=${encodeURIComponent(input)}`;
  const agentsHref = `/agents?q=${encodeURIComponent(input)}`;
  const rewrittenHref = intelligence.rewrittenPrompt
    ? `/assistant?q=${encodeURIComponent(intelligence.rewrittenPrompt)}`
    : assistantHref;

  return (
    <div className="rounded-[1.75rem] border border-violet-300/15 bg-violet-300/5 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">
        <Sparkles className="h-3.5 w-3.5" />
        Demo Lab → 智能编排
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-400">
        根据当前 tab 与选项生成 Prompt，可带入 Assistant 或 Agent 工具循环继续追问。
      </p>

      <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/50 p-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
          生成的上下文
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-300">{input}</p>
      </div>

      <div className="mt-3">
        <IntelligenceComposerPreview intelligence={intelligence} showFollowUps={false} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={assistantHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-violet-300/30"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          追问 Assistant
        </Link>
        <Link
          href={agentsHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:border-cyan-200/40"
        >
          <Bot className="h-3.5 w-3.5" />
          用 Agent 执行
        </Link>
        {intelligence.rewrittenPrompt ? (
          <Link
            href={rewrittenHref}
            className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:border-emerald-200/40"
          >
            改写 Prompt → Assistant
          </Link>
        ) : null}
      </div>
    </div>
  );
}
