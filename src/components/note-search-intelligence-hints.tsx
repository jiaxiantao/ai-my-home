"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { IntelligenceComposerPreview } from "@/components/intelligence-composer-preview";
import type { ComposerIntelligence } from "@/lib/front-intelligence";

export function NoteSearchIntelligenceHints({ query }: { query: string }) {
  const [intelligence, setIntelligence] = useState<ComposerIntelligence | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setIntelligence(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setLoading(true);
      void fetch("/api/intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      })
        .then(async (response) => {
          if (!response.ok) {
            return null;
          }
          const payload = (await response.json()) as {
            intelligence?: ComposerIntelligence;
          };
          return payload.intelligence ?? null;
        })
        .then((result) => setIntelligence(result))
        .finally(() => setLoading(false));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [query]);

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return null;
  }

  const assistantHref = `/assistant?q=${encodeURIComponent(trimmed)}`;
  const rewrittenHref = intelligence?.rewrittenPrompt
    ? `/assistant?q=${encodeURIComponent(intelligence.rewrittenPrompt)}`
    : assistantHref;

  return (
    <div className="rounded-2xl border border-violet-300/15 bg-violet-300/5 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">
        <Sparkles className="h-3.5 w-3.5" />
        检索意图编排
        {loading ? (
          <span className="font-normal normal-case text-slate-500">分析中…</span>
        ) : null}
      </p>

      {intelligence ? (
        <div className="mt-3">
          <IntelligenceComposerPreview intelligence={intelligence} showFollowUps={false} />
        </div>
      ) : !loading ? (
        <p className="mt-2 text-xs text-slate-500">输入关键词后将推断意图与追问建议。</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={assistantHref}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-violet-300/30"
        >
          用 Assistant 追问「{trimmed.slice(0, 24)}
          {trimmed.length > 24 ? "…" : ""}」
        </Link>
        {intelligence?.rewrittenPrompt ? (
          <Link
            href={rewrittenHref}
            className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:border-cyan-200/40"
          >
            使用改写 Prompt
          </Link>
        ) : null}
      </div>
    </div>
  );
}
