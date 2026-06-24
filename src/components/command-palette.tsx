"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Command, MessageCircle, Search } from "lucide-react";

import { EXTERNAL_PROJECTS, HOME_AGENT_AGENTS_URL } from "@/lib/external-projects";

type CommandItem = {
  label: string;
  href: string;
  group: string;
  keywords: readonly string[];
  external?: boolean;
};

const commands: CommandItem[] = [
  { label: "首页", href: "/", group: "导航", keywords: ["home", "index"] },
  { label: "智能编排", href: "/#front-intelligence", group: "AI", keywords: ["intelligence", "prompt"] },
  { label: "端侧 AI", href: "/#edge-ai", group: "AI", keywords: ["transformers", "wasm", "mediapipe"] },
  { label: "全栈看板", href: "/#dashboard", group: "工程", keywords: ["dashboard", "bff"] },
  { label: "发布中心", href: "/release-center", group: "工程", keywords: ["release", "cicd"] },
  { label: "笔记库", href: "/notes", group: "内容", keywords: ["notes", "pg_trgm"] },
  { label: "Assistant", href: "/assistant", group: "AI", keywords: ["chat", "llm"] },
  {
    label: "Agents",
    href: HOME_AGENT_AGENTS_URL,
    group: "AI",
    keywords: ["agent", "tools"],
    external: true,
  },
  { label: "运行时诊断", href: "/status", group: "工程", keywords: ["health", "status"] },
  {
    label: "3D 看车",
    href: EXTERNAL_PROJECTS.carShowroom.previewUrl,
    group: "体验",
    keywords: ["three", "3d"],
    external: true,
  },
  { label: "Resume", href: "/resume", group: "内容", keywords: ["cv", "profile"] },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        setQuery("");
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands;
    }
    return commands.filter(
      (item) =>
        item.label.toLowerCase().includes(normalized) ||
        item.group.toLowerCase().includes(normalized) ||
        item.keywords.some((keyword) => keyword.includes(normalized)),
    );
  }, [query]);

  const askQuery = query.trim();

  function goAskAssistant() {
    if (!askQuery) {
      return;
    }
    setOpen(false);
    router.push(`/assistant?q=${encodeURIComponent(askQuery)}`);
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 px-4 pt-[12vh] backdrop-blur-sm"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="快捷导航"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && askQuery && event.metaKey) {
                event.preventDefault();
                goAskAssistant();
              }
            }}
            placeholder="搜索页面，或输入问题后 ⌘↵ 问 Assistant…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {askQuery ? (
            <li className="mb-1 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={goAskAssistant}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-violet-100 transition hover:bg-violet-300/10"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-violet-300" />
                  向 Assistant 提问
                </span>
                <span className="max-w-[45%] truncate text-[10px] text-slate-500">
                  {askQuery}
                </span>
              </button>
            </li>
          ) : null}
          {filtered.length ? (
            filtered.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Command className="h-3.5 w-3.5 text-cyan-300/80" />
                      {item.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {item.group}
                    </span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Command className="h-3.5 w-3.5 text-cyan-300/80" />
                      {item.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {item.group}
                    </span>
                  </Link>
                )}
              </li>
            ))
          ) : (
            <li className="px-3 py-6 text-center text-sm text-slate-500">无匹配结果</li>
          )}
        </ul>
      </div>
    </div>
  );
}
