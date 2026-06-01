import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CapabilityProfileRadar } from "@/components/charts/capability-profile-radar";
import type { DashboardData } from "@/lib/dashboard-service";

function clampScore(value: number) {
  return Math.min(100, Math.max(40, Math.round(value)));
}

function buildCapabilityScores(dashboard: DashboardData) {
  const notesBoost = Math.min(dashboard.overview.notesCount * 4, 24);
  const demoBoost = Math.min(dashboard.overview.demoCapabilitiesCount * 3, 30);

  return {
    fullstackApi: clampScore(72 + notesBoost),
    engineeringDemos: clampScore(68 + demoBoost),
    cicdRelease: clampScore(78 + Math.min(dashboard.overview.caseStudiesCount * 3, 18)),
    edgeAi: clampScore(80 + Math.min(dashboard.overview.tracksCount * 4, 12)),
    visualization: clampScore(74 + Math.min(dashboard.overview.domainsCount * 3, 18)),
    security: clampScore(70 + Math.min(dashboard.overview.publishedNotesCount, 20)),
  };
}

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
  const scores = buildCapabilityScores(dashboard);

  return (
    <div className="grid gap-6 rounded-4xl border border-white/10 bg-slate-950/75 p-6 md:grid-cols-[1fr_1.1fr] md:p-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
          Capability Radar
        </p>
        <h3 className="text-2xl font-semibold text-white">能力雷达总览</h3>
        <p className="text-sm leading-7 text-slate-400">
          按全栈 API、工程 Demo、CI/CD、端侧 AI、3D 可视化、安全治理六个维度做加权展示。
          分数会随笔记规模、Demo 数量与交付样例动态变化，用于快速传达技术覆盖面。
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
      <CapabilityProfileRadar scores={scores} />
    </div>
  );
}
