"use client";

import { useEffect, useMemo, useState } from "react";

import { iconMap } from "@/lib/icon-map";
import type { DomainDetail, SiteProfile } from "@/lib/site-content";

type CapabilityTopologyProps = {
  profile: Pick<SiteProfile, "name" | "summary" | "focus" | "currentFocus">;
  domains: DomainDetail[];
};

type PositionedDomain = DomainDetail & {
  topology: {
    x: number;
    y: number;
    delay: number;
    accent: string;
    glow: string;
    label: string;
    signal: string;
    slotClass: string;
  };
};

const topologyNodeMeta: Record<
  string,
  {
    x: number;
    y: number;
    delay: number;
    accent: string;
    glow: string;
    label: string;
    signal: string;
    slotClass: string;
  }
> = {
  "frontend-architecture": {
    x: 50,
    y: 12,
    delay: 0,
    accent: "text-cyan-100",
    glow: "rgba(34, 211, 238, 0.28)",
    label: "前端架构",
    signal: "设计系统 / SSR",
    slotClass: "col-start-2 row-start-1 self-start",
  },
  "cross-platform-frontend": {
    x: 32,
    y: 12,
    delay: 0.4,
    accent: "text-rose-100",
    glow: "rgba(251, 113, 133, 0.24)",
    label: "大前端",
    signal: "H5 / 小程序 / 桌面",
    slotClass: "col-start-1 row-start-1 justify-self-start self-start",
  },
  "engineering-efficiency": {
    x: 16,
    y: 33,
    delay: 0.8,
    accent: "text-emerald-100",
    glow: "rgba(52, 211, 153, 0.24)",
    label: "工程效能",
    signal: "CI / DX / 规范",
    slotClass: "col-start-1 row-start-2 justify-self-start self-center",
  },
  "leadership-collaboration": {
    x: 84,
    y: 33,
    delay: 1.2,
    accent: "text-violet-100",
    glow: "rgba(167, 139, 250, 0.24)",
    label: "协作影响力",
    signal: "方案表达 / 复盘",
    slotClass: "col-start-3 row-start-2 justify-self-end self-center",
  },
  "performance-experience": {
    x: 16,
    y: 70,
    delay: 1.6,
    accent: "text-amber-100",
    glow: "rgba(251, 191, 36, 0.22)",
    label: "体验治理",
    signal: "性能 / 监控",
    slotClass: "col-start-1 row-start-4 justify-self-start self-center",
  },
  "fullstack-delivery": {
    x: 50,
    y: 88,
    delay: 2,
    accent: "text-sky-100",
    glow: "rgba(56, 189, 248, 0.22)",
    label: "全链路交付",
    signal: "Prisma / 数据",
    slotClass: "col-start-2 row-start-5 self-end",
  },
  "ai-automation": {
    x: 84,
    y: 70,
    delay: 2.4,
    accent: "text-fuchsia-100",
    glow: "rgba(217, 70, 239, 0.22)",
    label: "AI 自动化",
    signal: "知识库 / 流程",
    slotClass: "col-start-3 row-start-4 justify-self-end self-center",
  },
};

const relatedEdges = [
  ["cross-platform-frontend", "frontend-architecture"],
  ["cross-platform-frontend", "performance-experience"],
  ["cross-platform-frontend", "fullstack-delivery"],
  ["frontend-architecture", "engineering-efficiency"],
  ["frontend-architecture", "performance-experience"],
  ["engineering-efficiency", "ai-automation"],
  ["fullstack-delivery", "ai-automation"],
  ["leadership-collaboration", "engineering-efficiency"],
  ["performance-experience", "fullstack-delivery"],
] as const;

export function CapabilityTopology({
  profile,
  domains,
}: CapabilityTopologyProps) {
  const positionedDomains = useMemo<PositionedDomain[]>(() => {
    return domains.flatMap((domain) => {
      const topology = topologyNodeMeta[domain.slug];

      if (!topology) {
        return [];
      }

      return [
        {
          ...domain,
          topology,
        },
      ];
    });
  }, [domains]);

  const [activeSlug, setActiveSlug] = useState(positionedDomains[0]?.slug ?? "");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || positionedDomains.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlug((current) => {
        const currentIndex = positionedDomains.findIndex(
          (domain) => domain.slug === current,
        );
        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex + 1) % positionedDomains.length;

        return positionedDomains[nextIndex].slug;
      });
    }, 3200);

    return () => window.clearInterval(timer);
  }, [isPaused, positionedDomains]);

  const activeDomain =
    positionedDomains.find((domain) => domain.slug === activeSlug) ??
    positionedDomains[0];

  if (!activeDomain) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div
        className="topology-grid relative min-h-[42rem] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="absolute inset-0 opacity-90 transition-all duration-700"
          style={{
            background: [
              `radial-gradient(circle at ${activeDomain.topology.x}% ${activeDomain.topology.y}%, ${activeDomain.topology.glow}, transparent 18rem)`,
              "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.12), transparent 16rem)",
            ].join(", "),
          }}
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {positionedDomains.map((domain) => {
            const isActive = domain.slug === activeSlug;

            return (
              <line
                key={`center-${domain.slug}`}
                x1="50"
                y1="50"
                x2={domain.topology.x}
                y2={domain.topology.y}
                className={`topology-line ${
                  isActive ? "stroke-cyan-300/80" : "stroke-white/12"
                }`}
                strokeWidth={isActive ? 0.45 : 0.32}
                strokeLinecap="round"
              />
            );
          })}

          {relatedEdges.map(([from, to]) => {
            const left = positionedDomains.find((domain) => domain.slug === from);
            const right = positionedDomains.find((domain) => domain.slug === to);

            if (!left || !right) {
              return null;
            }

            const isActive =
              left.slug === activeSlug || right.slug === activeSlug;

            return (
              <line
                key={`${from}-${to}`}
                x1={left.topology.x}
                y1={left.topology.y}
                x2={right.topology.x}
                y2={right.topology.y}
                className={`topology-line ${
                  isActive ? "stroke-white/28" : "stroke-white/10"
                }`}
                strokeWidth={isActive ? 0.28 : 0.2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 grid grid-cols-[minmax(0,1fr)_minmax(12rem,15rem)_minmax(0,1fr)] grid-rows-[auto_1fr_auto_1fr_auto] items-center justify-items-center px-5 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)_minmax(0,1fr)] sm:px-8 sm:py-8">
          <div className="topology-core col-start-2 row-start-3 w-52 rounded-4xl border border-cyan-300/20 bg-slate-950/88 px-4 py-4 shadow-[0_0_80px_rgba(34,211,238,0.12)] backdrop-blur sm:w-60 sm:rounded-[2rem] sm:px-5 sm:py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Core Node
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {profile.name}
            </h3>
            <p className="mt-3 hidden text-sm leading-7 text-slate-300 sm:block">
              {profile.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.focus.slice(0, 3).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {positionedDomains.map((domain) => {
            const Icon = iconMap[domain.icon];
            const isActive = domain.slug === activeSlug;

            return (
              <div
                key={domain.slug}
                className={`topology-node ${domain.topology.slotClass}`}
                style={{
                  animationDelay: `${domain.topology.delay}s`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveSlug(domain.slug)}
                  onFocus={() => setActiveSlug(domain.slug)}
                  onMouseEnter={() => setActiveSlug(domain.slug)}
                  className={`group flex w-24 flex-col rounded-3xl border px-3 py-3 text-left transition duration-300 sm:w-32 sm:rounded-[1.5rem] sm:px-4 sm:py-4 ${
                    isActive
                      ? "border-cyan-300/45 bg-slate-900/95 shadow-[0_0_50px_rgba(34,211,238,0.16)]"
                      : "border-white/10 bg-slate-900/80 hover:border-white/25 hover:bg-slate-900/95"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`rounded-2xl border border-white/10 bg-white/5 p-2 ${domain.topology.accent}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300/80 shadow-[0_0_20px_rgba(34,211,238,0.65)]" />
                  </div>
                  <p className="mt-3 text-xs font-semibold leading-5 text-white sm:text-sm sm:leading-6">
                    {domain.topology.label}
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-400 sm:text-xs sm:leading-6">
                    {domain.topology.signal}
                  </p>
                </button>
              </div>
            );
          })}
        </div>

        <style jsx>{`
          .topology-grid::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
            background-size: 3.75rem 3.75rem;
            mask-image: radial-gradient(circle at center, black 48%, transparent 100%);
            pointer-events: none;
          }

          .topology-line {
            fill: none;
            stroke-dasharray: 5 9;
            animation: dash 18s linear infinite;
          }

          .topology-node {
            animation: float 7.5s ease-in-out infinite;
          }

          .topology-core {
            animation: corePulse 8s ease-in-out infinite;
          }

          @keyframes dash {
            from {
              stroke-dashoffset: 0;
            }
            to {
              stroke-dashoffset: -220;
            }
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes corePulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.02);
            }
          }
        `}</style>
      </div>

      <aside className="grid gap-4">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Active Domain
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {activeDomain.title}
          </h3>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-400">
            {activeDomain.expertiseLevel}
          </p>
          <p className="mt-5 text-sm leading-8 text-slate-300">
            {activeDomain.overview}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {activeDomain.highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100"
              >
                {item}
              </span>
            ))}
          </div>

          <a
            href={`/domains/${activeDomain.slug}`}
            className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
          >
            查看这个能力域的完整拆解
          </a>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Why It Connects
          </p>
          <div className="mt-5 grid gap-3">
            {activeDomain.principles.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Live Signals
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.currentFocus.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs leading-6 text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        </article>
      </aside>
    </div>
  );
}
