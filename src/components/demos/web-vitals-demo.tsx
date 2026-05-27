"use client";

import { useEffect, useState } from "react";

type VitalSample = {
  name: string;
  value: string;
  detail: string;
  rating: "good" | "needs" | "poor" | "na";
};

function ratingFromLcp(ms: number): VitalSample["rating"] {
  if (ms <= 2500) {
    return "good";
  }

  if (ms <= 4000) {
    return "needs";
  }

  return "poor";
}

function ratingFromCls(score: number): VitalSample["rating"] {
  if (score <= 0.1) {
    return "good";
  }

  if (score <= 0.25) {
    return "needs";
  }

  return "poor";
}

const ratingClass: Record<VitalSample["rating"], string> = {
  good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  needs: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  poor: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  na: "border-white/10 bg-white/5 text-slate-400",
};

export function WebVitalsDemo() {
  const [samples, setSamples] = useState<VitalSample[]>([
    {
      name: "采集器",
      value: "…",
      detail: "PerformanceObserver",
      rating: "na",
    },
  ]);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const entries: VitalSample[] = [];

    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;

    if (navigation) {
      const ttfb = Math.round(
        navigation.responseStart - navigation.requestStart,
      );
      entries.push({
        name: "TTFB",
        value: `${ttfb} ms`,
        detail: "responseStart - requestStart",
        rating: ttfb <= 800 ? "good" : ttfb <= 1800 ? "needs" : "poor",
      });
      entries.push({
        name: "DOM Complete",
        value: `${Math.round(navigation.domComplete)} ms`,
        detail: "navigation.domComplete",
        rating: "na",
      });
    }

    const paint = performance.getEntriesByType("paint");
    const fcp = paint.find((item) => item.name === "first-contentful-paint");

    if (fcp) {
      entries.push({
        name: "FCP",
        value: `${Math.round(fcp.startTime)} ms`,
        detail: "first-contentful-paint",
        rating: fcp.startTime <= 1800 ? "good" : "needs",
      });
    }

    setSamples(entries);

    const observers: PerformanceObserver[] = [];

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1) as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };

        if (!last) {
          return;
        }

        const value = last.renderTime || last.loadTime || last.startTime;
        const ms = Math.round(value);

        setSamples((current) => {
          const rest = current.filter((item) => item.name !== "LCP");
          return [
            ...rest,
            {
              name: "LCP",
              value: `${ms} ms`,
              detail: "largest-contentful-paint",
              rating: ratingFromLcp(ms),
            },
          ];
        });
        setLog((current) => [`LCP ${ms}ms`, ...current].slice(0, 6));
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpObserver);
    } catch {
      // unsupported
    }

    let clsScore = 0;

    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<
          PerformanceEntry & { value?: number; hadRecentInput?: boolean }
        >) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value ?? 0;
          }
        }

        const formatted = clsScore.toFixed(3);
        setSamples((current) => {
          const rest = current.filter((item) => item.name !== "CLS");
          return [
            ...rest,
            {
              name: "CLS",
              value: formatted,
              detail: "layout-shift 累计",
              rating: ratingFromCls(clsScore),
            },
          ];
        });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
      observers.push(clsObserver);
    } catch {
      // unsupported
    }

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {samples.map((sample) => (
          <article
            key={sample.name}
            className={`rounded-2xl border p-4 ${ratingClass[sample.rating]}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">
              {sample.name}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{sample.value}</p>
            <p className="mt-2 font-mono text-[11px] opacity-70">{sample.detail}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
          实时事件
        </p>
        <ul className="mt-3 space-y-2 font-mono text-xs text-slate-400">
          {log.length ? (
            log.map((line) => (
              <li key={line} className="rounded-lg bg-white/5 px-3 py-2">
                {line}
              </li>
            ))
          ) : (
            <li className="text-slate-500">滚动页面或等待 LCP 更新…</li>
          )}
        </ul>
        <p className="mt-4 text-xs leading-6 text-slate-500">
          浏览器 Performance API · 非模拟数据
        </p>
      </div>
    </div>
  );
}
