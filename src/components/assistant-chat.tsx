"use client";

import { useEffect, useRef, useState } from "react";

import { streamChatQuestion, type ChatReference } from "@/lib/chat-stream";

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "我在前端架构评审时最先确认什么？",
  "我通常怎么排查性能问题？",
  "我如何把 AI 放进工程流程里？",
];

export function AssistantChat({
  initialQuestion = "",
  autoRun = false,
}: {
  initialQuestion?: string;
  autoRun?: boolean;
}) {
  const hasAutoRun = useRef(false);
  const [question, setQuestion] = useState(initialQuestion);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [references, setReferences] = useState<ChatReference[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = initialQuestion?.trim();

    if (!autoRun || !trimmed || hasAutoRun.current) {
      return;
    }

    hasAutoRun.current = true;
    void submitQuestion(trimmed);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when q is in URL
  }, [autoRun, initialQuestion]);

  async function submitQuestion(currentQuestion: string) {
    setError(null);
    setIsSubmitting(true);
    setReferences([]);

    setMessages((current) => [
      ...current,
      { role: "user", content: currentQuestion },
      { role: "assistant", content: "" },
    ]);

    let streamed = "";

    try {
      await streamChatQuestion(currentQuestion, {
        onReferences: (items) => setReferences(items),
        onChunk: (text) => {
          streamed += text;
          setMessages((current) => {
            const next = [...current];
            const lastIndex = next.length - 1;

            if (lastIndex >= 0 && next[lastIndex]?.role === "assistant") {
              next[lastIndex] = { role: "assistant", content: streamed };
            }

            return next;
          });
        },
        onError: (message) => {
          throw new Error(message);
        },
      });

      if (!streamed.trim()) {
        throw new Error("没有收到流式内容");
      }
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "问答失败";
      setError(message);
      setMessages((current) => {
        const next = [...current];
        const lastIndex = next.length - 1;

        if (lastIndex >= 0 && next[lastIndex]?.role === "assistant") {
          next[lastIndex] = {
            role: "assistant",
            content:
              streamed ||
              "这次回答没有成功返回。请确认 Ollama 已启动：ollama serve && ollama pull llama3.2",
          };
        }

        return next;
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim() || isSubmitting) {
      return;
    }

    const currentQuestion = question.trim();
    setQuestion("");
    await submitQuestion(currentQuestion);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            对话窗口
          </h2>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] text-cyan-100">
            SSE · POST /api/chat
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setQuestion(prompt)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {messages.length ? (
            messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`rounded-[1.5rem] border p-5 ${
                  message.role === "assistant"
                    ? "border-cyan-300/20 bg-cyan-300/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                  {message.role === "assistant" ? "Assistant" : "Question"}
                  {message.role === "assistant" && isSubmitting && !message.content
                    ? " · streaming"
                    : null}
                </p>
                <p className="mt-3 text-sm leading-8 whitespace-pre-wrap text-slate-200">
                  {message.content || (isSubmitting ? "▍" : "")}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-400">
              pg_trgm 召回笔记 → SSE 流式输出 token
            </div>
          )}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            placeholder="输入问题…"
            className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "流式生成中…" : "流式提问"}
          </button>
        </form>
      </div>

      <aside className="grid gap-4">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            References
          </p>
          <p className="mt-3 text-sm text-slate-400">
            流开始前先推送 references 事件（含 trgm score）。
          </p>
        </article>

        {references.length ? (
          references.map((reference) => (
            <article
              key={reference.id}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-lg font-semibold text-white">{reference.title}</h3>
              {reference.summary ? (
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {reference.summary}
                </p>
              ) : null}
              <a
                href={`/notes/${reference.slug}`}
                className="mt-5 inline-flex text-sm font-semibold text-cyan-200 transition hover:text-white"
              >
                打开来源笔记
              </a>
            </article>
          ))
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/70 p-6 text-sm text-slate-400">
            发送问题后展示召回笔记。
          </div>
        )}
      </aside>
    </div>
  );
}
