"use client";

import { useState } from "react";
import { Monitor, Smartphone, TabletSmartphone } from "lucide-react";

import { DesktopRuntimeDemo } from "@/components/demos/desktop-runtime-demo";
import { MiniprogramLayersDemo } from "@/components/demos/miniprogram-layers-demo";
import { MobileViewportDemo } from "@/components/demos/mobile-viewport-demo";

type PlatformId = "mobile" | "miniprogram" | "desktop";

const platforms: Array<{
  id: PlatformId;
  title: string;
  tech: string;
  icon: typeof Smartphone;
}> = [
  {
    id: "mobile",
    title: "移动端 H5",
    tech: "viewport · 安全区 · 触控",
    icon: Smartphone,
  },
  {
    id: "miniprogram",
    title: "小程序",
    tech: "双线程 · 分包 · Bridge",
    icon: TabletSmartphone,
  },
  {
    id: "desktop",
    title: "桌面端",
    tech: "Electron · Tauri · Capacitor",
    icon: Monitor,
  },
];

export function CrossPlatformShowcase() {
  const [active, setActive] = useState<PlatformId>("mobile");

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {platforms.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-cyan-300/35 bg-cyan-300/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-cyan-200/80" />
                <span className="text-sm font-semibold text-white">{item.title}</span>
              </div>
              <span className="mt-1 block font-mono text-[10px] text-slate-500">
                {item.tech}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 md:p-7">
        {active === "mobile" ? <MobileViewportDemo /> : null}
        {active === "miniprogram" ? <MiniprogramLayersDemo /> : null}
        {active === "desktop" ? <DesktopRuntimeDemo /> : null}
      </div>
    </div>
  );
}
