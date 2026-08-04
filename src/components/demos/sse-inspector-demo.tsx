"use client";

import { EXTERNAL_PROJECTS } from "@/lib/external-projects";

export function SseInspectorDemo() {
  return (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-slate-400">
        SSE 对话帧监视已迁移至 Knowledge Studio 的 <code className="text-cyan-200">POST /api/chat</code>
        。本站保留跳转入口，避免跨域演示干扰本地 API 延迟基准。
      </p>
      <a
        href={`${EXTERNAL_PROJECTS.knowledgeStudio.previewUrl}assistant/`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
      >
        打开 Knowledge Studio Assistant →
      </a>
    </div>
  );
}
