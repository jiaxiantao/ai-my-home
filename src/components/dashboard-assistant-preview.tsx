"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { streamChatQuestion, type ChatReference } from "@/lib/chat-stream";

const quickPrompt = "我在前端架构评审时最先确认什么？";

export function DashboardAssistantPreview({ llmLabel }: { llmLabel?: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [references, setReferences] = useState<ChatReference[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(value: string) {
    const currentQuestion = value.trim();
    if (!currentQuestion || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setAnswer("");
    setReferences([]);

    let streamed = "";

    try {
      await streamChatQuestion(currentQuestion, {
        onReferences: (items) => setReferences(items),
        onChunk: (text) => {
          streamed += text;
          setAnswer(streamed);
        },
        onError: (message) => {
          throw new Error(message);
        },
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "问答失败",
      );
      if (!streamed) {
        setAnswer(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="font-mono text-xs text-slate-500">
        POST /api/chat {"{ stream: true }"} · SSE
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
        className="grid gap-3"
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="问一个和笔记相关的问题…"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-50"
          >
            {isSubmitting ? "SSE…" : "流式回答"}
          </button>
          <button
            type="button"
            onClick={() => {
              setQuestion(quickPrompt);
              void ask(quickPrompt);
            }}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/25 hover:bg-white/5"
          >
            示例问题
          </button>
        </div>
      </form>

      {error ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {answer !== null ? (
        <article className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
            {isSubmitting ? "Streaming" : "Answer"}
          </p>
          <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-slate-200">
            {answer || "▍"}
          </p>
        </article>
      ) : (
        <p className="text-sm text-slate-500">{llmLabel ?? "SSE · 本地 LLM"}</p>
      )}

      {references.length ? (
        <div className="grid gap-2">
          {references.slice(0, 3).map((reference) => (
            <a
              key={reference.id}
              href={`/notes/${reference.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm transition hover:border-white/20"
            >
              <span className="font-semibold text-white">{reference.title}</span>
            </a>
          ))}
        </div>
      ) : null}

      <a
        href="/assistant"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
      >
        完整对话页
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
