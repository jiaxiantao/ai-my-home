"use client";

import { useState } from "react";

const devices = [
  {
    id: "iphone",
    label: "iPhone 15",
    width: 390,
    height: 844,
    safeArea: "env(safe-area-inset-bottom)",
    dpr: 3,
  },
  {
    id: "android",
    label: "Android",
    width: 412,
    height: 915,
    safeArea: "24px",
    dpr: 2.625,
  },
  {
    id: "tablet",
    label: "Tablet",
    width: 768,
    height: 1024,
    safeArea: "16px",
    dpr: 2,
  },
] as const;

export function MobileViewportDemo() {
  const [deviceId, setDeviceId] =
    useState<(typeof devices)[number]["id"]>("iphone");

  const device = devices.find((item) => item.id === deviceId) ?? devices[0];
  const scale = Math.min(1, 320 / device.width);

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-slate-400">
        移动端 H5 交付：视口、安全区、触控热区与 1x/2x/3x 资源策略。切换设备规格查看布局约束。
      </p>

      <div className="flex flex-wrap gap-2">
        {devices.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDeviceId(item.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              item.id === deviceId
                ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                : "border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div
          className="rounded-[2rem] border-[10px] border-slate-800 bg-slate-900 p-2 shadow-2xl"
          style={{
            width: device.width * scale + 20,
          }}
        >
          <div
            className="relative overflow-hidden rounded-[1.25rem] bg-slate-950"
            style={{
              width: device.width * scale,
              height: device.height * scale * 0.72,
            }}
          >
            <div className="border-b border-white/10 bg-slate-900/90 px-3 py-2 text-center text-[10px] text-slate-400">
              H5 · {device.width}×{device.height}
            </div>
            <div className="space-y-2 p-3">
              <div className="h-8 rounded-lg bg-white/10" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 rounded-lg bg-cyan-300/15" />
                <div className="h-16 rounded-lg bg-white/5" />
              </div>
              <div className="h-20 rounded-lg bg-white/5" />
            </div>
            <div
              className="absolute inset-x-0 bottom-0 border-t border-cyan-300/20 bg-slate-950/95 px-3 py-2"
              style={{ paddingBottom: 8 }}
            >
              <div className="mx-auto h-10 max-w-[200px] rounded-full bg-white text-center text-[10px] leading-10 font-semibold text-slate-950">
                主操作 · 48px 热区
              </div>
            </div>
          </div>
        </div>

        <dl className="grid min-w-[200px] flex-1 gap-2 font-mono text-xs text-slate-400">
          <div className="flex justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <dt>viewport</dt>
            <dd className="text-cyan-100">
              {device.width} × {device.height}
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <dt>devicePixelRatio</dt>
            <dd className="text-cyan-100">{device.dpr}</dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <dt>safe-area</dt>
            <dd className="text-cyan-100">{device.safeArea}</dd>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-500">
            rem / vw · 避免 100vh 坑 · 软键盘顶起用 visualViewport
          </div>
        </dl>
      </div>
    </div>
  );
}
