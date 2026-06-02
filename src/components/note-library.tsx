"use client";

import { useMemo, useState } from "react";

import type { NoteRecord } from "@/lib/notes-service";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildExcerpt(note: NoteRecord) {
  const base = note.summary || note.contentMarkdown;
  const normalized = normalizeText(base);

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 180)}...`;
}

function matchesQuery(note: NoteRecord, query: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    note.title,
    note.summary ?? "",
    note.contentMarkdown,
    note.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function NoteLibrary({ notes }: { notes: NoteRecord[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");

  const tags = useMemo(() => {
    return [...new Set(notes.flatMap((note) => note.tags))].sort((left, right) =>
      left.localeCompare(right, "zh-CN"),
    );
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesTag = activeTag === "all" || note.tags.includes(activeTag);

      return matchesTag && matchesQuery(note, query);
    });
  }, [activeTag, notes, query]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Public Library
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            先按主题浏览，再进入单条笔记继续深挖
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            我把公开笔记放在这里，既可以直接搜索关键词，也可以按标签筛选。更完整的上下文会继续落到单条笔记详情页里。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Published Notes
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {notes.length}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Topics
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {tags.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white">搜索笔记</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：架构、性能、AI 工作流"
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag("all")}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeTag === "all"
                ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                : "border-white/10 bg-slate-950/80 text-slate-300 hover:border-white/20 hover:text-white"
            }`}
          >
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeTag === tag
                  ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 bg-slate-950/80 text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length ? (
        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Updated {dateFormatter.format(new Date(note.updatedAt))}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    {note.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {buildExcerpt(note)}
                  </p>
                </div>

                <a
                  href={`/notes/${note.slug}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
                >
                  阅读笔记
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-slate-950/70 p-8 text-sm leading-7 text-slate-400">
          当前筛选下还没有结果，可以换个关键词，或者切回其他标签再看看。
        </div>
      )}
    </div>
  );
}
