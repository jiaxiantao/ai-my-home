"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ExperienceChapter } from "@/lib/ongoing-content";

type ExperienceAccordionProps = {
  items: ExperienceChapter[];
};

export function ExperienceAccordion({ items }: ExperienceAccordionProps) {
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                  {item.period}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
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
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <ExperienceColumn title="Responsibilities" items={item.responsibilities} />
                <ExperienceColumn title="Projects" items={item.projects} />
                <ExperienceColumn title="Outcomes" items={item.outcomes} accent />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ExperienceColumn({
  title,
  items,
  accent = false,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 ${
        accent
          ? "border-cyan-300/20 bg-cyan-300/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
