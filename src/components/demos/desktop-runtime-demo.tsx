"use client";

import { useMemo, useState } from "react";

type RuntimeId = "electron" | "tauri" | "capacitor";

const runtimes: Array<{
  id: RuntimeId;
  label: string;
  shell: string;
  bundle: string;
  pros: string[];
  cons: string[];
  fit: string;
}> = [
  {
    id: "electron",
    label: "Electron",
    shell: "Chromium + Node.js",
    bundle: "~120MB+",
    pros: ["生态成熟", "npm 全量可用", "调试链完善"],
    cons: ["包体大", "内存占用高", "安全面需加固"],
    fit: "内部工具 / 重 Web 能力桌面端",
  },
  {
    id: "tauri",
    label: "Tauri",
    shell: "系统 WebView + Rust",
    bundle: "~3–15MB",
    pros: ["体积小", "性能好", "Rust 侧系统能力"],
    cons: ["WebView 差异", "Rust 学习成本", "复杂 native 需插件"],
    fit: "轻量工具 / 对包体敏感的场景",
  },
  {
    id: "capacitor",
    label: "Capacitor",
    shell: "Web + 原生壳",
    bundle: "随 Store 分发",
    pros: ["与 Ionic/React 顺滑", "插件市场", "一套 Web 多端"],
    cons: ["性能天花板", "深度 native 仍要桥接", "商店审核约束"],
    fit: "已有 H5/小程序团队扩桌面/移动端",
  },
];

const checklist = [
  "是否需要系统托盘 / 全局快捷键",
  "是否离线优先与本地文件读写",
  "自动更新与代码签名策略",
  "是否必须上架 Mac App Store / Microsoft Store",
];

export function DesktopRuntimeDemo() {
  const [active, setActive] = useState<RuntimeId>("electron");

  const runtime = useMemo(
    () => runtimes.find((item) => item.id === active) ?? runtimes[0],
    [active],
  );

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-slate-400">
        桌面端不是「把网页塞进窗口」。选型要看包体、系统能力、更新链路与团队栈。
      </p>

      <div className="flex flex-wrap gap-2">
        {runtimes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              item.id === active
                ? "border-violet-300/35 bg-violet-300/10 text-violet-100"
                : "border-white/10 text-slate-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-lg font-semibold text-white">{runtime.label}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{runtime.shell}</p>
          <p className="mt-3 text-sm text-slate-400">典型包体 {runtime.bundle}</p>
          <p className="mt-4 text-sm text-cyan-100/90">适合：{runtime.fit}</p>
        </article>

        <div className="grid gap-3">
          <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <p className="text-xs font-semibold text-emerald-200">优势</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {runtime.pros.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
            <p className="text-xs font-semibold text-amber-200">注意</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {runtime.cons.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">
          选型清单
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {checklist.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
            >
              {item}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
