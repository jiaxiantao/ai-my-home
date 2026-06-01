"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Command, Search } from "lucide-react";

const commands = [
  { label: "首页", href: "/", group: "导航", keywords: ["home", "index"] },
  { label: "智能编排", href: "/#front-intelligence", group: "AI", keywords: ["intelligence", "prompt"] },
  { label: "端侧 AI", href: "/#edge-ai", group: "AI", keywords: ["transformers", "wasm", "mediapipe"] },
  { label: "全栈看板", href: "/#dashboard", group: "工程", keywords: ["dashboard", "bff"] },
  { label: "发布中心", href: "/release-center", group: "工程", keywords: ["release", "cicd"] },
  { label: "笔记库", href: "/notes", group: "内容", keywords: ["notes", "pg_trgm"] },
  { label: "Assistant", href: "/assistant", group: "AI", keywords: ["chat", "llm"] },
  { label: "Agents", href: "/agents", group: "AI", keywords: ["agent", "tools"] },
  { label: "运行时诊断", href: "/status", group: "工程", keywords: ["health", "status"] },
  { label: "3D 看车", href: "/car-showroom", group: "体验", keywords: ["three", "3d"] },
  { label: "Resume", href: "/resume", group: "内容", keywords: ["cv", "profile"] },
] as const;

export function CommandPalette() {
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
            placeholder="搜索页面或能力…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length ? (
            filtered.map((item) => (
              <li key={item.href}>
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
