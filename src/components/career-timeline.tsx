"use client";

import { useState } from "react";

import type { CareerStage } from "@/lib/showcase-content";

type CareerTimelineProps = {
  items: CareerStage[];
};

export function CareerTimeline({ items }: CareerTimelineProps) {
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
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/80">
                {item.period}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
            </button>
          );
        })}
      </div>

      <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/75">
          当前阶段聚焦
        </p>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {activeItem.title}
        </h3>
        <p className="mt-4 text-base leading-8 text-slate-300">{activeItem.summary}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">核心关注点</p>
            <ul className="mt-4 space-y-3">
              {activeItem.focus.map((entry) => (
                <li key={entry} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">能力增长信号</p>
            <ul className="mt-4 space-y-3">
              {activeItem.achievements.map((entry) => (
                <li key={entry} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}
