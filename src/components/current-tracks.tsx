"use client";

import { useState } from "react";

import type { CurrentTrack } from "@/lib/ongoing-content";

type CurrentTracksProps = {
  items: CurrentTrack[];
};

export function CurrentTracks({ items }: CurrentTracksProps) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");
  const activeItem = items.find((item) => item.slug === activeSlug) ?? items[0];

  if (!activeItem) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="grid gap-3">
        {items.map((item) => {
          const isActive = item.slug === activeItem.slug;

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => setActiveSlug(item.slug)}
              className={`rounded-[1.75rem] border p-5 text-left transition ${
                isActive
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
            </button>
          );
        })}
      </div>

      <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
          Active Track
        </p>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {activeItem.title}
        </h3>
        <p className="mt-4 text-base leading-8 text-slate-300">{activeItem.summary}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {activeItem.stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-4">
          {activeItem.notes.map((note) => (
            <div
              key={note}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300"
            >
              {note}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
