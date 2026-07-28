import Link from "next/link";
import { ArrowRight, GitBranch, ShieldCheck } from "lucide-react";

import { BorderGlow } from "@/components/reactbits/border-glow";
import { CountUp } from "@/components/reactbits/count-up";
import { Magnet } from "@/components/reactbits/magnet";
import { StarBorder } from "@/components/reactbits/star-border";
import { formatReleaseOrderStatus } from "@/lib/release-labels";
import type { ReleaseSummary } from "@/lib/release-service";
import { formatReleaseStoreMode } from "@/lib/release-store-labels";

const pipelineStages = [
  { label: "Build", detail: "产物构建" },
  { label: "Test", detail: "Unit + E2E" },
  { label: "Pre", detail: "预发验证" },
  { label: "Prod", detail: "审批 + 窗口" },
] as const;

export function ReleaseCenterSpotlight({ release }: { release: ReleaseSummary }) {
  const inProgress = release.orderCount - release.byStatus.released;

  return (
    <div className="grid gap-6 rounded-4xl border border-white/10 bg-gradient-to-br from-cyan-300/10 via-slate-950/80 to-slate-950/90 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
          CI / CD
        </p>
        <h3 className="text-2xl font-semibold text-white">工程化发布单系统</h3>
        <p className="max-w-xl text-sm leading-7 text-slate-400">
          应用注册、构建流水线、质量门禁与测试/预发/生产分环境发布，配套审计日志、并发锁与生产回滚，用于展示真实交付治理能力。
        </p>

        <div className="grid grid-cols-3 gap-2">
          <BorderGlow className="rounded-2xl" glowColor="rgba(103, 232, 249, 0.24)">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">应用</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                <CountUp to={release.appCount} duration={1.5} separator="," />
              </p>
            </div>
          </BorderGlow>
          <BorderGlow className="rounded-2xl" glowColor="rgba(103, 232, 249, 0.24)">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">发布单</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                <CountUp to={release.orderCount} duration={1.5} separator="," />
              </p>
            </div>
          </BorderGlow>
          <BorderGlow className="rounded-2xl" glowColor="rgba(103, 232, 249, 0.24)">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">进行中</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                <CountUp to={inProgress} duration={1.5} separator="," />
              </p>
            </div>
          </BorderGlow>
        </div>

        {release.recentOrders.length > 0 ? (
          <ul className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              最近发布单
            </p>
            {release.recentOrders.slice(0, 3).map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <span className="text-slate-200">
                  {order.appName} · {order.version}
                </span>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-cyan-100">
                  {formatReleaseOrderStatus(order.status)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono">
            store: {formatReleaseStoreMode(release.storeMode)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <GitBranch className="h-3.5 w-3.5 text-cyan-200" />
            发布单状态机
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
            变更单 + 审批元信息
          </span>
        </div>
        <Magnet>
          <StarBorder className="rounded-full" color="rgba(255, 255, 255, 0.9)">
            <Link
              href="/release-center"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              打开发布中心
              <ArrowRight className="h-4 w-4" />
            </Link>
          </StarBorder>
        </Magnet>
      </div>

      <div className="grid gap-3">
        {pipelineStages.map((stage, index) => (
          <BorderGlow
            key={stage.label}
            className="rounded-2xl"
            glowColor="rgba(103, 232, 249, 0.22)"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{stage.label}</p>
                <p className="text-xs text-slate-400">{stage.detail}</p>
              </div>
            </div>
          </BorderGlow>
        ))}
      </div>
    </div>
  );
}
