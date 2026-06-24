"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { IntelligenceComposerPreview } from "@/components/intelligence-composer-preview";
import { Input } from "@/components/ui/input";
import { EXTERNAL_PROJECTS } from "@/lib/external-projects";
import { analyzeComposer, getPreferenceTemplate } from "@/lib/front-intelligence";
import {
  defaultIntelligencePreferences,
  type IntelligenceDepth,
  type IntelligencePreferences,
  type IntelligenceStyle,
} from "@/lib/front-intelligence-preferences";

export function FrontIntelligenceComposerDemo({
  samplePrompts = [],
  llmLabel,
  compact = false,
}: {
  samplePrompts?: string[];
  llmLabel?: string;
  compact?: boolean;
}) {
  const [composer, setComposer] = useState(
    "我们首页 LCP 偏高，请给分层优化方案与验收指标",
  );
  const [preferences, setPreferences] = useState<IntelligencePreferences>(
    defaultIntelligencePreferences,
  );

  const intelligence = useMemo(
    () => analyzeComposer(composer, [], preferences),
    [composer, preferences],
  );

  const template = useMemo(() => getPreferenceTemplate(preferences), [preferences]);

  const assistantHref = `/assistant?q=${encodeURIComponent(
    intelligence.rewrittenPrompt ?? composer,
  )}`;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          纯前端规则引擎 · 意图识别 · Prompt 改写 · 零网络延迟
          {llmLabel ? ` · 对话后端 ${llmLabel}` : ""}
        </p>
        <Link
          href={assistantHref}
          className="inline-flex items-center gap-1 rounded-full border border-violet-300/30 bg-violet-300/10 px-3 py-1 text-xs text-violet-100 transition hover:border-violet-200/50"
        >
          带到 Assistant
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {samplePrompts.length ? (
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setComposer(prompt)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-left text-xs text-slate-300 transition hover:border-violet-300/25 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "steps" as IntelligenceStyle, label: "步骤清单" },
            { key: "risk" as IntelligenceStyle, label: "风险优先" },
            { key: "code" as IntelligenceStyle, label: "代码优先" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPreferences((current) => ({ ...current, style: item.key }))}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              preferences.style === item.key
                ? "border-violet-200/40 bg-violet-200/15 text-violet-100"
                : "border-white/10 text-slate-400"
            }`}
          >
            {item.label}
          </button>
        ))}
        {(
          [
            { key: "brief" as IntelligenceDepth, label: "简略" },
            { key: "detailed" as IntelligenceDepth, label: "详细" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPreferences((current) => ({ ...current, depth: item.key }))}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              preferences.depth === item.key
                ? "border-emerald-200/40 bg-emerald-200/15 text-emerald-100"
                : "border-white/10 text-slate-400"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            setPreferences((current) => ({
              ...current,
              includeMetrics: !current.includeMetrics,
            }))
          }
          className={`rounded-full border px-3 py-1 text-[11px] ${
            preferences.includeMetrics
              ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100"
              : "border-white/10 text-slate-400"
          }`}
        >
          指标{preferences.includeMetrics ? "开" : "关"}
        </button>
      </div>

      <Input
        value={composer}
        onChange={(event) => setComposer(event.target.value)}
        placeholder="输入你的前端问题，观察意图与改写结果…"
        className="font-mono text-sm"
      />

      <IntelligenceComposerPreview
        intelligence={intelligence}
        showFollowUps={false}
        onApplyRewrite={() =>
          setComposer(intelligence.rewrittenPrompt ?? composer)
        }
        onAppendAction={(action) =>
          setComposer((current) => `${current.trim()}\n${action}`.trim())
        }
      />

      {!compact ? (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-violet-200" />
              改写预览
            </p>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-300">
              {intelligence.rewrittenPrompt ?? composer}
            </pre>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              输出模板
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-300">
              {template.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </article>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href={assistantHref}
          className="inline-flex h-8 items-center justify-center rounded-full bg-cyan-200 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          用改写结果开聊
        </Link>
        <a
          href={EXTERNAL_PROJECTS.homeAgent.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center rounded-full border border-white/20 px-3 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
        >
          Agent 工具循环
        </a>
      </div>
    </div>
  );
}
