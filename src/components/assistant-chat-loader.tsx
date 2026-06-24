"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
  initialQuestion: initialQuestionProp,
  autoRun,
  llmLabel,
}: {
  initialQuestion?: string;
  autoRun?: boolean;
  llmLabel?: string;
}) {
  const [initialQuestion, setInitialQuestion] = useState(initialQuestionProp);

  useEffect(() => {
    if (initialQuestionProp?.trim()) {
      return;
    }

    const q = new URLSearchParams(window.location.search).get("q") ?? undefined;
    if (q) {
      setInitialQuestion(q);
    }
  }, [initialQuestionProp]);

  const shouldAutoRun = autoRun ?? Boolean(initialQuestion?.trim());

  return (
    <AssistantChat
      initialQuestion={initialQuestion}
      autoRun={shouldAutoRun}
      llmLabel={llmLabel}
    />
  );
}
