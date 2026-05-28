"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BranchSwitcher,
  ChatSessionSidebar,
} from "@/components/assistant/chat-session-sidebar";
import { ChatComposer } from "@/components/assistant/chat-composer";
import { IntelligenceLearningPanel } from "@/components/intelligence-learning-panel";
import {
  ChatMessageBubble,
  ReferenceCard,
} from "@/components/assistant/chat-message";
import { streamChatQuestion, type ChatReference } from "@/lib/chat-stream";
import type { ChatImageAttachment, ChatMessage, ChatMetrics, ChatSession } from "@/lib/chat-types";
import { getChatSessionBootstrap } from "@/lib/chat-session-bootstrap";
import { analyzeComposer, getPreferenceTemplate } from "@/lib/front-intelligence";
import {
  bumpLearningProfile,
  defaultIntelligencePreferences,
  exportIntelligenceConfig,
  importIntelligenceConfig,
  loadHistoryEvents,
  loadLearningProfile,
  loadIntelligencePreferences,
  pushHistoryEvent,
  resetHistoryEvents,
  resetLearningProfile,
  saveHistoryEvents,
  saveLearningProfile,
  saveIntelligencePreferences,
  type IntelligenceDepth,
  type IntelligenceStyle,
} from "@/lib/front-intelligence-preferences";
import {
  createEmptySession,
  deriveSessionTitle,
  forkBranchFromMessage,
  getActiveBranch,
  saveSessions,
  updateSessionBranch,
} from "@/lib/chat-sessions";

const starterPrompts = [
  "我在前端架构评审时最先确认什么？",
  "我通常怎么排查性能问题？",
  "我如何把 AI 放进工程流程里？",
];

function createMessage(
  role: ChatMessage["role"],
  content: string,
  extra: Partial<ChatMessage> = {},
): ChatMessage {
  return {
    id: `msg-${crypto.randomUUID()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

function buildQuestionText(question: string, images: ChatImageAttachment[]) {
  if (!images.length) {
    return question;
  }

  const names = images.map((image) => image.name).join("、");
  return `${question}\n\n[附件图片: ${names} · 多模态演示，模型侧仍以文本上下文回答]`;
}

export function AssistantChat({
  initialQuestion = "",
  autoRun = false,
  llmLabel,
}: {
  initialQuestion?: string;
  autoRun?: boolean;
  llmLabel?: string;
}) {
  const hasAutoRun = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const bootstrap = getChatSessionBootstrap();
  const [sessions, setSessions] = useState<ChatSession[]>(bootstrap.sessions);
  const [activeSessionId, setActiveSessionId] = useState(bootstrap.activeSessionId);
  const [composer, setComposer] = useState(initialQuestion);
  const [images, setImages] = useState<ChatImageAttachment[]>([]);
  const [references, setReferences] = useState<ChatReference[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ChatMetrics>({});
  const [intelligencePreferences, setIntelligencePreferences] = useState(() =>
    loadIntelligencePreferences(),
  );
  const [learningProfile, setLearningProfile] = useState(() => loadLearningProfile());
  const [historyEvents, setHistoryEvents] = useState(() => loadHistoryEvents());

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const activeBranch = activeSession ? getActiveBranch(activeSession) : null;
  const messages = useMemo(() => activeBranch?.messages ?? [], [activeBranch]);
  const intelligence = useMemo(
    () => analyzeComposer(composer, messages, intelligencePreferences),
    [composer, messages, intelligencePreferences],
  );

  useEffect(() => {
    saveIntelligencePreferences(intelligencePreferences);
  }, [intelligencePreferences]);
  useEffect(() => {
    saveLearningProfile(learningProfile);
  }, [learningProfile]);
  useEffect(() => {
    saveHistoryEvents(historyEvents);
  }, [historyEvents]);

  const preferenceTemplate = useMemo(
    () => getPreferenceTemplate(intelligencePreferences),
    [intelligencePreferences],
  );

  const applyStylePreference = useCallback((style: IntelligenceStyle) => {
    setIntelligencePreferences((current) => {
      const next = { ...current, style };
      setHistoryEvents((history) => pushHistoryEvent(history, next));
      return next;
    });
    setLearningProfile((current) => bumpLearningProfile(current, { style }));
  }, []);

  const applyDepthPreference = useCallback((depth: IntelligenceDepth) => {
    setIntelligencePreferences((current) => {
      const next = { ...current, depth };
      setHistoryEvents((history) => pushHistoryEvent(history, next));
      return next;
    });
    setLearningProfile((current) => bumpLearningProfile(current, { depth }));
  }, []);

  const persistSessions = useCallback((next: ChatSession[]) => {
    setSessions(next);
    saveSessions(next);
  }, []);

  const patchActiveBranch = useCallback(
    (updater: (messages: ChatMessage[]) => ChatMessage[]) => {
      setSessions((allSessions) => {
        const nextSessions = allSessions.map((session) => {
          if (session.id !== activeSessionId) {
            return session;
          }

          const branch = getActiveBranch(session);
          const updated = updateSessionBranch(session, branch.id, updater);

          return {
            ...updated,
            title: deriveSessionTitle(getActiveBranch(updated).messages),
          };
        });

        saveSessions(nextSessions);
        return nextSessions;
      });
    },
    [activeSessionId],
  );

  const runStream = useCallback(
    async (
      question: string,
      options: { regenerate?: boolean; replaceLastAssistant?: boolean } = {},
    ) => {
      setError(null);
      setIsSubmitting(true);
      setReferences([]);
      setMetrics({});

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const assistantMessage = createMessage("assistant", "", {
        status: "streaming",
      });
      const assistantId = assistantMessage.id;

      patchActiveBranch((current) => {
        let base = current;
        if (options.replaceLastAssistant) {
          const lastAssistantIndex = findLastIndex(
            base,
            (message) => message.role === "assistant",
          );
          if (lastAssistantIndex >= 0) {
            base = base.slice(0, lastAssistantIndex);
          }
        }
        return [...base, assistantMessage];
      });

      let streamed = "";
      const startedAt = performance.now();
      let firstRefAt: number | null = null;
      let firstChunkAt: number | null = null;
      let metaConfidence: number | undefined;
      let metaAlternatives: string[] | undefined;

      try {
        await streamChatQuestion(
          question,
          {
            onReferences: (items) => {
              if (firstRefAt === null) {
                firstRefAt = performance.now();
                setMetrics((current) => ({
                  ...current,
                  searchMs: Math.round(firstRefAt! - startedAt),
                }));
              }
              setReferences(items);
            },
            onMeta: (meta) => {
              metaConfidence = meta.confidence;
              metaAlternatives = meta.alternatives;
            },
            onChunk: (text) => {
              if (firstChunkAt === null) {
                firstChunkAt = performance.now();
                setMetrics((current) => ({
                  ...current,
                  ttftMs: Math.round(firstChunkAt! - startedAt),
                }));
              }
              streamed += text;
              patchActiveBranch((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: streamed }
                    : message,
                ),
              );
            },
            onError: (message) => {
              throw new Error(message);
            },
            onDone: () => {
              setMetrics((current) => ({
                ...current,
                totalMs: Math.round(performance.now() - startedAt),
              }));
            },
          },
          {
            signal: controller.signal,
            regenerate: options.regenerate,
            temperature: options.regenerate ? 0.55 : undefined,
          },
        );

        if (!streamed.trim() && !controller.signal.aborted) {
          throw new Error("没有收到流式内容");
        }

        patchActiveBranch((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content:
                    streamed ||
                    "（已停止或无内容返回）",
                  status: controller.signal.aborted ? "stopped" : "complete",
                  confidence: metaConfidence,
                  alternatives: metaAlternatives,
                }
              : message,
          ),
        );
      } catch (submissionError) {
        if ((submissionError as { name?: string }).name === "AbortError") {
          patchActiveBranch((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: streamed || "（生成已停止）",
                    status: "stopped",
                    confidence: metaConfidence,
                    alternatives: metaAlternatives,
                  }
                : message,
            ),
          );
        } else {
          const message =
            submissionError instanceof Error
              ? submissionError.message
              : "问答失败";
          setError(message);
          patchActiveBranch((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content:
                      streamed ||
                      "这次回答没有成功返回。请确认 Ollama 已启动。",
                    status: "error",
                  }
                : message,
            ),
          );
        }
      } finally {
        setIsSubmitting(false);
        abortRef.current = null;
      }
    },
    [patchActiveBranch],
  );

  const submitUserMessage = useCallback(
    async (rawQuestion: string, userImages: ChatImageAttachment[] = []) => {
      const trimmed = rawQuestion.trim();
      if (!trimmed || isSubmitting) {
        return;
      }

      const question = buildQuestionText(trimmed, userImages);

      patchActiveBranch((current) => [
        ...current,
        createMessage("user", trimmed, { images: userImages }),
      ]);

      await runStream(question);
    },
    [isSubmitting, patchActiveBranch, runStream],
  );

  useEffect(() => {
    const trimmed = initialQuestion?.trim();

    if (!autoRun || !trimmed || hasAutoRun.current || !activeSession) {
      return;
    }

    hasAutoRun.current = true;
    void submitUserMessage(trimmed);
  }, [autoRun, initialQuestion, activeSession, submitUserMessage]);

  function handleStop() {
    abortRef.current?.abort();
  }

  function handleNewSession() {
    const fresh = createEmptySession();
    const next = [fresh, ...sessions];
    persistSessions(next);
    setActiveSessionId(fresh.id);
    setComposer("");
    setImages([]);
    setReferences([]);
    setError(null);
  }

  function handleDeleteSession(sessionId: string) {
    const next = sessions.filter((session) => session.id !== sessionId);
    if (!next.length) {
      handleNewSession();
      return;
    }
    persistSessions(next);
    if (activeSessionId === sessionId) {
      setActiveSessionId(next[0].id);
    }
  }

  function handleSwitchBranch(branchId: string) {
    if (!activeSession) {
      return;
    }

    persistSessions(
      sessions.map((session) =>
        session.id === activeSession.id
          ? { ...session, activeBranchId: branchId }
          : session,
      ),
    );
  }

  function handleEditMessage(messageId: string, content: string) {
    if (!content.trim()) {
      return;
    }

    const index = messages.findIndex((message) => message.id === messageId);
    if (index === -1) {
      return;
    }

    const target = messages[index];
    const kept = messages.slice(0, index + 1).map((message, idx) =>
      idx === index ? { ...message, content: content.trim() } : message,
    );

    patchActiveBranch(() => kept);

    void runStream(
      buildQuestionText(content.trim(), target.images ?? []),
    );
  }

  function handleRegenerate() {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) {
      return;
    }

    patchActiveBranch((current) => {
      const lastAssistantIndex = findLastIndex(
        current,
        (message) => message.role === "assistant",
      );
      if (lastAssistantIndex === -1) {
        return current;
      }
      return current.slice(0, lastAssistantIndex);
    });

    void runStream(buildQuestionText(lastUser.content, lastUser.images ?? []), {
      regenerate: true,
      replaceLastAssistant: true,
    });
  }

  function handleBranch(messageId: string) {
    if (!activeSession) {
      return;
    }

    const forked = forkBranchFromMessage(activeSession, messageId);
    persistSessions(
      sessions.map((session) =>
        session.id === forked.id ? forked : session,
      ),
    );
    setActiveSessionId(forked.id);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.32fr_1.68fr]">
      <ChatSessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={setActiveSessionId}
        onCreate={handleNewSession}
        onDelete={handleDeleteSession}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                对话窗口
              </h2>
              {activeSession ? (
                <p className="mt-1 text-sm text-slate-500">{activeSession.title}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] text-cyan-100">
                SSE · Markdown · 会话
              </span>
              {llmLabel ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-slate-300">
                  {llmLabel}
                </span>
              ) : null}
            </div>
          </div>

          {activeSession ? (
            <div className="mt-4">
              <BranchSwitcher session={activeSession} onSwitch={handleSwitchBranch} />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setComposer(prompt)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
              Frontend Intelligence
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { key: "steps", label: "偏步骤" },
                  { key: "risk", label: "偏风险" },
                  { key: "code", label: "偏代码" },
                ] as Array<{ key: IntelligenceStyle; label: string }>
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => applyStylePreference(item.key)}
                  className={`rounded-full border px-3 py-1 text-[11px] ${
                    intelligencePreferences.style === item.key
                      ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100"
                      : "border-white/10 text-slate-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {(
                [
                  { key: "brief", label: "简略" },
                  { key: "detailed", label: "详细" },
                ] as Array<{ key: IntelligenceDepth; label: string }>
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => applyDepthPreference(item.key)}
                  className={`rounded-full border px-3 py-1 text-[11px] ${
                    intelligencePreferences.depth === item.key
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
                  setIntelligencePreferences((current) => {
                    const next = {
                      ...current,
                      includeMetrics: !current.includeMetrics,
                    };
                    setHistoryEvents((history) => pushHistoryEvent(history, next));
                    return next;
                  })
                }
                className={`rounded-full border px-3 py-1 text-[11px] ${
                  intelligencePreferences.includeMetrics
                    ? "border-violet-200/40 bg-violet-200/15 text-violet-100"
                    : "border-white/10 text-slate-400"
                }`}
              >
                指标{intelligencePreferences.includeMetrics ? "已开启" : "已关闭"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIntelligencePreferences(defaultIntelligencePreferences);
                  setHistoryEvents((history) =>
                    pushHistoryEvent(history, defaultIntelligencePreferences),
                  );
                  setLearningProfile(resetLearningProfile());
                }}
                className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400"
              >
                恢复默认
              </button>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                当前模板预览
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {preferenceTemplate.map((line) => (
                  <li key={line}>- {line}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3">
              <IntelligenceLearningPanel
                learningProfile={learningProfile}
                preferences={intelligencePreferences}
                onApplyRecommendation={(next) =>
                  setIntelligencePreferences((current) => {
                    const merged = {
                      ...current,
                      style: next.style,
                      depth: next.depth,
                    };
                    setHistoryEvents((history) => pushHistoryEvent(history, merged));
                    return merged;
                  })
                }
                history={historyEvents}
                onResetLearning={() => {
                  setLearningProfile(resetLearningProfile());
                  setHistoryEvents(resetHistoryEvents());
                }}
                onExport={() => {
                  const blob = new Blob(
                    [
                      exportIntelligenceConfig({
                        preferences: intelligencePreferences,
                        learning: learningProfile,
                        history: historyEvents,
                      }),
                    ],
                    { type: "application/json" },
                  );
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "assistant-intelligence-config.json";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                onImport={(raw) => {
                  const imported = importIntelligenceConfig(raw);
                  if (!imported) {
                    setError("导入失败：配置格式无效");
                    return;
                  }
                  setIntelligencePreferences(imported.preferences);
                  setLearningProfile(imported.learning);
                  setHistoryEvents(imported.history);
                  setError(null);
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {intelligence.intents.map((intent) => (
                <span
                  key={intent.label}
                  className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-3 py-1 text-[11px] text-cyan-100"
                >
                  {intent.label} · {Math.round(intent.score * 100)}%
                </span>
              ))}
            </div>
            {intelligence.rewrittenPrompt ? (
              <button
                type="button"
                onClick={() => setComposer(intelligence.rewrittenPrompt ?? composer)}
                className="mt-3 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:border-white/30"
              >
                应用智能改写
              </button>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {intelligence.actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setComposer((current) => `${current.trim()}\n${action}`.trim())}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-white/20"
                >
                  + {action}
                </button>
              ))}
            </div>
            {intelligence.followUps.length ? (
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  基于上一条回答，建议继续追问
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {intelligence.followUps.map((follow) => (
                    <button
                      key={follow}
                      type="button"
                      onClick={() => setComposer(follow)}
                      className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100 hover:border-emerald-200/40"
                    >
                      {follow}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid max-h-[32rem] gap-4 overflow-y-auto pr-1">
            {messages.length ? (
              messages.map((message, index) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={
                    isSubmitting &&
                    message.role === "assistant" &&
                    index === messages.length - 1
                  }
                  onEdit={
                    message.role === "user"
                      ? (content) => handleEditMessage(message.id, content)
                      : undefined
                  }
                  onRegenerate={
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
                    !isSubmitting
                      ? handleRegenerate
                      : undefined
                  }
                  onBranch={() => handleBranch(message.id)}
                  onUseAlternative={(prompt) => {
                    setComposer(prompt);
                    void submitUserMessage(prompt);
                  }}
                />
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-400">
                流式 UI · 图片/语音输入 · 会话分支 · 置信度与重新生成
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <ChatComposer
            value={composer}
            onChange={setComposer}
            images={images}
            onImagesChange={setImages}
            isSubmitting={isSubmitting}
            onSubmit={() => {
              const value = composer;
              setComposer("");
              const picked = images;
              setImages([]);
              void submitUserMessage(value, picked);
            }}
            onStop={handleStop}
          />
        </div>

        <aside className="grid gap-4">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              Observability
            </p>
            <div className="mt-4 grid gap-2 text-xs font-mono text-slate-300">
              <MetricRow label="检索" value={metrics.searchMs} />
              <MetricRow label="TTFT" value={metrics.ttftMs} />
              <MetricRow label="Total" value={metrics.totalMs} />
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
              References
            </p>
            <p className="mt-3 text-sm text-slate-400">
              召回分数影响置信度展示；可点备选视角重新提问。
            </p>
          </article>

          {references.length ? (
            references.map((reference) => (
              <ReferenceCard key={reference.id} reference={reference} />
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/70 p-6 text-sm text-slate-400">
              发送问题后展示召回笔记。
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function findLastIndex<T>(
  items: T[],
  predicate: (item: T) => boolean,
): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return index;
    }
  }

  return -1;
}

function MetricRow({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span>{label}</span>
      <span className="text-cyan-100">
        {value != null ? `${value} ms` : "—"}
      </span>
    </div>
  );
}
