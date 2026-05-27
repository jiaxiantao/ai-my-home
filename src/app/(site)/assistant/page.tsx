import type { Metadata } from "next";

import { AssistantChat } from "@/components/assistant-chat";
import { SystemRuntimeStrip } from "@/components/system-runtime-strip";
import { getLlmLabel, isLlmConfigured } from "@/lib/llm-config";

export const metadata: Metadata = {
  title: "Assistant | XJ / Frontend Systems",
  description:
    "An AI assistant that answers questions by retrieving and grounding responses in my notes.",
};

type AssistantPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function AssistantPage({
  searchParams,
}: AssistantPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialQuestion = Array.isArray(resolvedSearchParams.q)
    ? resolvedSearchParams.q[0]
    : resolvedSearchParams.q;

  const llmLabel = isLlmConfigured() ? getLlmLabel() : undefined;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Assistant</p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          pg_trgm 召回 + SSE 流式回答
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          笔记检索作为上下文，经 POST /api/chat 以 SSE 推送 token。带 ?q= 的链接会自动发起提问。
        </p>
        <div className="mt-6">
          <SystemRuntimeStrip />
        </div>
      </section>

      <section className="space-y-6">
        <AssistantChat
          initialQuestion={initialQuestion}
          autoRun={Boolean(initialQuestion?.trim())}
          llmLabel={llmLabel}
        />
      </section>
    </main>
  );
}
