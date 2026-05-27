"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Playbook } from "@/lib/showcase-content";

type PlaybookAccordionProps = {
  items: Playbook[];
};

export function PlaybookAccordion({ items }: PlaybookAccordionProps) {
  const [openSlug, setOpenSlug] = useState(items[0]?.slug ?? "");

  return (
    <div className="grid gap-4">
      {items.map((item) => {
        const isOpen = item.slug === openSlug;

        return (
          <article
            key={item.slug}
            className={cn(
              "rounded-[2rem] border p-6 transition",
              isOpen
                ? "border-cyan-300/30 bg-cyan-300/8"
                : "border-white/10 bg-slate-950/80",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenSlug(isOpen ? "" : item.slug)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  {item.summary}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen ? (
              <div className="mt-8 grid gap-5">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                    Scenario
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.scenario}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">识别信号</p>
                    <ul className="mt-4 space-y-3">
                      {item.signals.map((signal) => (
                        <li key={signal} className="flex gap-3 text-sm text-slate-300">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 lg:col-span-2">
                    <p className="text-sm font-semibold text-white">推进阶段</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {item.phases.map((phase) => (
                        <div
                          key={phase.title}
                          className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4"
                        >
                          <p className="text-sm font-semibold text-white">{phase.title}</p>
                          <p className="mt-3 text-sm leading-7 text-slate-300">
                            {phase.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-sm font-semibold text-white">典型产物</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {item.deliverables.map((entry) => (
                      <span
                        key={entry}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
                      >
                        {entry}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
