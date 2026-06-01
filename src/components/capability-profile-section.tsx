import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CapabilityProfileRadar } from "@/components/charts/capability-profile-radar";
import type { DashboardData } from "@/lib/dashboard-service";

const capabilityLinks = [
  { href: "/#tech-demos", label: "工程 Demo" },
  { href: "/release-center", label: "发布中心" },
  { href: "/#edge-ai", label: "端侧 AI" },
  { href: "/#viz", label: "3D 可视化" },
  { href: "/status", label: "运行时诊断" },
] as const;

export function CapabilityProfileSection({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const { capabilityProfile, release } = dashboard;

  return (
    <div className="grid gap-6 rounded-4xl border border-white/10 bg-slate-950/75 p-6 md:grid-cols-[1fr_1.1fr] md:p-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
          Capability Radar
        </p>
        <h3 className="text-2xl font-semibold text-white">能力雷达总览</h3>
        <p className="text-sm leading-7 text-slate-400">
          分数由 `/api/dashboard` 统一计算输出，随笔记规模、Demo 数量、发布单与案例数动态变化。
          当前已登记 {release.appCount} 个应用、{release.orderCount} 张发布单。
        </p>
        <div className="flex flex-wrap gap-2">
          {capabilityLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
            >
              {item.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>
      <CapabilityProfileRadar scores={capabilityProfile} />
    </div>
  );
}
