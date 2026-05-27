"use client";

import { useState } from "react";

import type { InterviewHighlight } from "@/lib/showcase-content";

type InterviewHighlightsProps = {
  items: InterviewHighlight[];
};

export function InterviewHighlights({ items }: InterviewHighlightsProps) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");
  const activeItem = items.find((item) => item.slug === activeSlug) ?? items[0];

  if (!activeItem) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {items.map((item) => {
          const isActive = item.slug === activeItem.slug;

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => setActiveSlug(item.slug)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <div className="flex flex-wrap gap-2">
          {activeItem.labels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              {label}
            </span>
          ))}
        </div>

        <h3 className="mt-6 text-3xl font-semibold tracking-tight text-white">
          {activeItem.title}
        </h3>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          {activeItem.summary}
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <HighlightColumn
            title="Challenge"
            content={activeItem.challenge}
            variant="default"
          />
          <HighlightListColumn
            title="Approach"
            entries={activeItem.approach}
            variant="muted"
          />
          <HighlightListColumn
            title="Output"
            entries={activeItem.output}
            variant="accent"
          />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/75">
            Why it matters in interview
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-100">{activeItem.takeaway}</p>
        </div>
      </article>
    </div>
  );
}

function HighlightColumn({
  title,
  content,
  variant,
}: {
  title: string;
  content: string;
  variant: "default" | "muted" | "accent";
}) {
  const className =
    variant === "accent"
      ? "border-cyan-300/20 bg-cyan-300/10"
      : variant === "muted"
        ? "border-white/10 bg-white/5"
        : "border-white/10 bg-slate-900/80";

  return (
    <div className={`rounded-[1.5rem] border p-5 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {title}
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-300">{content}</p>
    </div>
  );
}

function HighlightListColumn({
  title,
  entries,
  variant,
}: {
  title: string;
  entries: string[];
  variant: "default" | "muted" | "accent";
}) {
  return (
    <div>
      <HighlightColumn title={title} content="" variant={variant} />
      <div className="-mt-14 px-5 pb-5">
        <ul className="space-y-3 pt-10">
          {entries.map((entry) => (
            <li key={entry} className="flex gap-3 text-sm text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
              <span>{entry}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
