"use client";

import {
  animate,
  motion,
  motionValue,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import { iconMap } from "@/lib/icon-map";
import type { DomainDetail, SiteProfile } from "@/lib/site-content";

type CapabilityTopologyProps = {
  profile: Pick<SiteProfile, "name" | "summary" | "focus" | "currentFocus">;
  domains: DomainDetail[];
};

type TopologyMeta = {
  x: number;
  y: number;
  accent: string;
  glow: string;
  label: string;
  signal: string;
};

type PositionedDomain = DomainDetail & {
  topology: TopologyMeta;
};

type NodeMotion = {
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  restX: number;
  restY: number;
};

const SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 14,
  mass: 0.85,
};

const topologyNodeMeta: Record<string, TopologyMeta> = {
  "frontend-architecture": {
    x: 50,
    y: 12,
    accent: "text-cyan-100",
    glow: "rgba(34, 211, 238, 0.28)",
    label: "前端架构",
    signal: "设计系统 / SSR",
  },
  "cross-platform-frontend": {
    x: 84,
    y: 12,
    accent: "text-rose-100",
    glow: "rgba(251, 113, 133, 0.24)",
    label: "大前端",
    signal: "H5 / 小程序 / 桌面",
  },
  "engineering-efficiency": {
    x: 16,
    y: 30,
    accent: "text-emerald-100",
    glow: "rgba(52, 211, 153, 0.24)",
    label: "工程效能",
    signal: "CI / DX / 规范",
  },
  "leadership-collaboration": {
    x: 84,
    y: 30,
    accent: "text-violet-100",
    glow: "rgba(167, 139, 250, 0.24)",
    label: "协作影响力",
    signal: "方案表达 / 复盘",
  },
  "performance-experience": {
    x: 16,
    y: 68,
    accent: "text-amber-100",
    glow: "rgba(251, 191, 36, 0.22)",
    label: "体验治理",
    signal: "性能 / 监控",
  },
  "fullstack-delivery": {
    x: 50,
    y: 88,
    accent: "text-sky-100",
    glow: "rgba(56, 189, 248, 0.22)",
    label: "全链路交付",
    signal: "Prisma / 数据",
  },
  "ai-automation": {
    x: 84,
    y: 68,
    accent: "text-fuchsia-100",
    glow: "rgba(217, 70, 239, 0.22)",
    label: "AI 自动化",
    signal: "知识库 / 流程",
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

function useContainerSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 1, h: 1 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        w: Math.max(rect.width, 1),
        h: Math.max(rect.height, 1),
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function toViewPoint(
  node: NodeMotion,
  size: { w: number; h: number },
): { x: number; y: number } {
  return {
    x: node.restX + (node.offsetX.get() / size.w) * 100,
    y: node.restY + (node.offsetY.get() / size.h) * 100,
  };
}

function TopologyConnections({
  domains,
  activeSlug,
  motions,
  size,
}: {
  domains: PositionedDomain[];
  activeSlug: string;
  motions: Map<string, NodeMotion>;
  size: { w: number; h: number };
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sizeRef = useRef(size);
  const domainsRef = useRef(domains);
  const motionsRef = useRef(motions);
  const rafRef = useRef(0);

  useLayoutEffect(() => {
    sizeRef.current = size;
    domainsRef.current = domains;
    motionsRef.current = motions;
  }, [size, domains, motions]);

  useLayoutEffect(() => {
    const paint = () => {
      const svg = svgRef.current;
      if (!svg) {
        return;
      }

      const currentSize = sizeRef.current;
      const currentMotions = motionsRef.current;

      for (const domain of domainsRef.current) {
        const node = currentMotions.get(domain.slug);
        const line = svg.querySelector<SVGLineElement>(
          `[data-center-line="${domain.slug}"]`,
        );
        if (!node || !line) {
          continue;
        }
        const point = toViewPoint(node, currentSize);
        line.setAttribute("x2", String(point.x));
        line.setAttribute("y2", String(point.y));
      }

      for (const [from, to] of relatedEdges) {
        const left = currentMotions.get(from);
        const right = currentMotions.get(to);
        const line = svg.querySelector<SVGLineElement>(
          `[data-edge-line="${from}__${to}"]`,
        );
        if (!left || !right || !line) {
          continue;
        }
        const fromPoint = toViewPoint(left, currentSize);
        const toPoint = toViewPoint(right, currentSize);
        line.setAttribute("x1", String(fromPoint.x));
        line.setAttribute("y1", String(fromPoint.y));
        line.setAttribute("x2", String(toPoint.x));
        line.setAttribute("y2", String(toPoint.y));
      }
    };

    const schedulePaint = () => {
      if (rafRef.current) {
        return;
      }
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        paint();
      });
    };

    const unsubs = [...motions.values()].flatMap((node) => [
      node.offsetX.on("change", schedulePaint),
      node.offsetY.on("change", schedulePaint),
    ]);

    paint();

    return () => {
      unsubs.forEach((unsub) => unsub());
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [motions, size, domains, activeSlug]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {domains.map((domain) => {
        const node = motions.get(domain.slug);
        if (!node) {
          return null;
        }

        const point = toViewPoint(node, size);
        const isActive = domain.slug === activeSlug;

        return (
          <line
            key={`center-${domain.slug}`}
            data-center-line={domain.slug}
            x1="50"
            y1="50"
            x2={point.x}
            y2={point.y}
            className={`topology-line ${
              isActive ? "stroke-cyan-300/80" : "stroke-white/12"
            }`}
            strokeWidth={isActive ? 0.45 : 0.32}
            strokeLinecap="round"
          />
        );
      })}

      {relatedEdges.map(([from, to]) => {
        const left = motions.get(from);
        const right = motions.get(to);

        if (!left || !right) {
          return null;
        }

        const fromPoint = toViewPoint(left, size);
        const toPoint = toViewPoint(right, size);
        const isActive = from === activeSlug || to === activeSlug;

        return (
          <line
            key={`${from}-${to}`}
            data-edge-line={`${from}__${to}`}
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            className={`topology-line ${
              isActive ? "stroke-white/28" : "stroke-white/10"
            }`}
            strokeWidth={isActive ? 0.28 : 0.2}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function DraggableTopologyNode({
  domain,
  isActive,
  motionNode,
  constraintsRef,
  onActivate,
  onDragActiveChange,
}: {
  domain: PositionedDomain;
  isActive: boolean;
  motionNode: NodeMotion;
  constraintsRef: RefObject<HTMLElement | null>;
  onActivate: () => void;
  onDragActiveChange: (active: boolean) => void;
}) {
  const Icon = iconMap[domain.icon];
  const draggedRef = useRef(false);

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${domain.topology.x}%`,
        top: `${domain.topology.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        style={{ x: motionNode.offsetX, y: motionNode.offsetY }}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.18}
        dragMomentum={false}
        whileDrag={{ scale: 1.06, cursor: "grabbing", zIndex: 20 }}
        className="cursor-grab touch-none"
        onDragStart={() => {
          draggedRef.current = false;
          onDragActiveChange(true);
          onActivate();
        }}
        onDrag={(_, info) => {
          if (Math.hypot(info.offset.x, info.offset.y) > 6) {
            draggedRef.current = true;
          }
        }}
        onDragEnd={() => {
          onDragActiveChange(false);
          void animate(motionNode.offsetX, 0, SPRING);
          void animate(motionNode.offsetY, 0, SPRING);
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (draggedRef.current) {
              draggedRef.current = false;
              return;
            }
            onActivate();
          }}
          onFocus={onActivate}
          className={`group flex w-24 flex-col rounded-3xl border px-3 py-3 text-left transition duration-300 sm:w-32 sm:rounded-3xl sm:px-4 sm:py-4 ${
            isActive
              ? "border-cyan-300/45 bg-slate-900/50 shadow-[0_0_50px_rgba(34,211,238,0.16)]"
              : "border-white/10 bg-slate-900/40 hover:border-white/25 hover:bg-slate-900/50"
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
      </motion.div>
    </div>
  );
}

export function CapabilityTopology({
  profile,
  domains,
}: CapabilityTopologyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useContainerSize(containerRef);
  const dragCountRef = useRef(0);

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

  const motions = useMemo(() => {
    const map = new Map<string, NodeMotion>();

    for (const domain of positionedDomains) {
      map.set(domain.slug, {
        offsetX: motionValue(0),
        offsetY: motionValue(0),
        restX: domain.topology.x,
        restY: domain.topology.y,
      });
    }

    return map;
  }, [positionedDomains]);

  const [activeSlug, setActiveSlug] = useState(positionedDomains[0]?.slug ?? "");
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const isPaused = hovered || dragging;

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
        ref={containerRef}
        className="topology-grid relative min-h-[42rem] overflow-hidden rounded-4xl border border-white/10 bg-slate-950/40"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90 transition-all duration-700"
          style={{
            background: [
              `radial-gradient(circle at ${activeDomain.topology.x}% ${activeDomain.topology.y}%, ${activeDomain.topology.glow}, transparent 18rem)`,
              "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.12), transparent 16rem)",
            ].join(", "),
          }}
        />

        <TopologyConnections
          domains={positionedDomains}
          activeSlug={activeSlug}
          motions={motions}
          size={size}
        />

        <div className="topology-core pointer-events-none absolute left-1/2 top-1/2 z-20 w-52 rounded-4xl border border-cyan-300/20 bg-slate-950/45 px-4 py-4 shadow-[0_0_80px_rgba(34,211,238,0.12)] backdrop-blur sm:w-60 sm:rounded-4xl sm:px-5 sm:py-5">
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
          const motionNode = motions.get(domain.slug);
          if (!motionNode) {
            return null;
          }

          return (
            <DraggableTopologyNode
              key={domain.slug}
              domain={domain}
              isActive={domain.slug === activeSlug}
              motionNode={motionNode}
              constraintsRef={containerRef}
              onActivate={() => setActiveSlug(domain.slug)}
              onDragActiveChange={(active) => {
                if (active) {
                  dragCountRef.current += 1;
                  setDragging(true);
                  return;
                }
                dragCountRef.current = Math.max(0, dragCountRef.current - 1);
                if (dragCountRef.current === 0) {
                  setDragging(false);
                }
              }}
            />
          );
        })}

        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-[11px] tracking-wide text-slate-500 sm:text-xs">
          拖动外围节点 · 松开后弹力回弹
        </p>

        <style jsx>{`
          .topology-grid::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.04) 1px,
                transparent 1px
              );
            background-size: 3.75rem 3.75rem;
            mask-image: radial-gradient(
              circle at center,
              black 48%,
              transparent 100%
            );
            pointer-events: none;
          }

          .topology-core {
            transform: translate(-50%, -50%);
            animation: corePulse 8s ease-in-out infinite;
          }

          @keyframes corePulse {
            0%,
            100% {
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.02);
            }
          }
        `}</style>
        <style jsx global>{`
          .topology-line {
            fill: none;
            stroke-dasharray: 5 9;
            animation: topology-dash 18s linear infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .topology-line {
              animation: none;
            }

            .topology-core {
              animation: none !important;
            }
          }

          @keyframes topology-dash {
            from {
              stroke-dashoffset: 0;
            }
            to {
              stroke-dashoffset: -220;
            }
          }
        `}</style>
      </div>

      <aside className="grid gap-4">
        <article className="rounded-4xl border border-white/10 bg-slate-950/40 p-7">
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

        <article className="rounded-4xl border border-white/10 bg-slate-950/40 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
            Why It Connects
          </p>
          <div className="mt-5 grid gap-3">
            {activeDomain.principles.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-4xl border border-white/10 bg-slate-950/40 p-7">
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
