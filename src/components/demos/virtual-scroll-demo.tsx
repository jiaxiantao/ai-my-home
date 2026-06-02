"use client";

import { useMemo, useRef, useState } from "react";

const totalItems = 10_000;
const rowHeight = 44;
const allItems = Array.from({ length: totalItems }, (_, index) => ({
  id: index,
  title: `Note row #${index + 1}`,
  tag: ["架构", "性能", "AI", "工程"][index % 4],
}));

export function VirtualScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(320);

  const { start, visible, offsetY, domCount } = useMemo(() => {
    const overscan = 4;
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
    const endIndex = Math.min(totalItems, startIndex + visibleCount);

    return {
      start: startIndex,
      visible: allItems.slice(startIndex, endIndex),
      offsetY: startIndex * rowHeight,
      domCount: endIndex - startIndex,
    };
  }, [scrollTop, viewportHeight]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
      <div
        ref={containerRef}
        className="h-80 overflow-auto rounded-2xl border border-white/10 bg-slate-950/80"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        onMouseEnter={() => {
          if (containerRef.current) {
            setViewportHeight(containerRef.current.clientHeight);
          }
        }}
      >
        <div style={{ height: totalItems * rowHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visible.map((item) => (
              <div
                key={item.id}
                style={{ height: rowHeight }}
                className="flex items-center justify-between border-b border-white/5 px-4 text-sm"
              >
                <span className="text-white">{item.title}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 content-start">
        <Metric label="数据总量" value={String(totalItems)} />
        <Metric label="当前 DOM 行" value={String(domCount)} />
        <Metric label="滚动起点 index" value={String(start)} />
        <p className="text-sm leading-7 text-slate-400">
          只渲染视口内行（windowing），10k 条列表仍保持可滚动帧率。对比全量渲染会瞬间创建
          1 万个节点。
        </p>
        <button
          type="button"
          className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300"
          onClick={() => {
            containerRef.current?.scrollTo({ top: 4400, behavior: "smooth" });
          }}
        >
          跳到中间 (~#100)
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-100">{value}</p>
    </div>
  );
}
