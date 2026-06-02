"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type EventKind = "raw" | "debounce" | "throttle";

type LogEntry = {
  id: number;
  kind: EventKind;
  at: number;
};

export function DebounceThrottleDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [debounceCount, setDebounceCount] = useState(0);
  const [throttleCount, setThrottleCount] = useState(0);
  const idRef = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleLock = useRef(false);
  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushLog = useCallback((kind: EventKind) => {
    idRef.current += 1;
    setLogs((current) =>
      [{ id: idRef.current, kind, at: Date.now() }, ...current].slice(0, 24),
    );
  }, []);

  function handleRaw() {
    setRawCount((value) => value + 1);
    pushLog("raw");
  }

  function handleDebounce() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebounceCount((value) => value + 1);
      pushLog("debounce");
    }, 300);
  }

  function handleThrottle() {
    if (throttleLock.current) {
      return;
    }

    throttleLock.current = true;
    setThrottleCount((value) => value + 1);
    pushLog("throttle");

    throttleTimer.current = setTimeout(() => {
      throttleLock.current = false;
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, []);

  const kindColor: Record<EventKind, string> = {
    raw: "text-rose-200",
    debounce: "text-cyan-200",
    throttle: "text-emerald-200",
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-slate-400">
        快速连点模拟高频输入：debounce 等停顿后触发一次，throttle 固定窗口内最多一次。
        搜索框常用 debounce，滚动/resize 常用 throttle。
      </p>

      <div className="flex flex-wrap gap-3">
        <TriggerButton label="原始 input" count={rawCount} onClick={handleRaw} />
        <TriggerButton
          label="debounce 300ms"
          count={debounceCount}
          onClick={handleDebounce}
          accent="cyan"
        />
        <TriggerButton
          label="throttle 300ms"
          count={throttleCount}
          onClick={handleThrottle}
          accent="emerald"
        />
      </div>

      <div className="grid gap-2 rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs">
        {logs.length ? (
          logs.map((entry) => (
            <div key={entry.id} className="flex gap-3 text-slate-400">
              <span className={kindColor[entry.kind]}>{entry.kind.padEnd(8)}</span>
              <span>fired</span>
            </div>
          ))
        ) : (
          <p className="text-slate-500">连点上方按钮查看触发差异</p>
        )}
      </div>
    </div>
  );
}

function TriggerButton({
  label,
  count,
  onClick,
  accent = "rose",
}: {
  label: string;
  count: number;
  onClick: () => void;
  accent?: "rose" | "cyan" | "emerald";
}) {
  const activeClass =
    accent === "cyan"
      ? "border-cyan-300/35 bg-cyan-300/10"
      : accent === "emerald"
        ? "border-emerald-300/35 bg-emerald-300/10"
        : "border-rose-300/35 bg-rose-300/10";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition hover:opacity-90 ${activeClass}`}
    >
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-1 font-mono text-[10px] text-slate-400">触发 {count} 次</p>
    </button>
  );
}
