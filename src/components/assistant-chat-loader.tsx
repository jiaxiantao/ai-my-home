"use client";

import dynamic from "next/dynamic";

const AssistantChat = dynamic(
  () =>
    import("@/components/assistant-chat").then((module) => module.AssistantChat),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm text-slate-400">
        正在加载对话工作台…
      </div>
    ),
  },
);

export function AssistantChatLoader({
  initialQuestion,
  autoRun,
  llmLabel,
}: {
  initialQuestion?: string;
  autoRun?: boolean;
  llmLabel?: string;
}) {
  return (
    <AssistantChat
      initialQuestion={initialQuestion}
      autoRun={autoRun}
      llmLabel={llmLabel}
    />
  );
}
