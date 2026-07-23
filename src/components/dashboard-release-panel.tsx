import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatReleaseOrderStatus } from "@/lib/release-labels";
import { formatReleaseStoreMode } from "@/lib/release-store-labels";
import type { ReleaseSummary } from "@/lib/release-service";

const statusOrder = [
  "draft",
  "built",
  "testing",
  "staging",
  "released",
] as const;

export function DashboardReleasePanel({ release }: { release: ReleaseSummary }) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
          Release Pipeline
        </p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-slate-400">
          store: {formatReleaseStoreMode(release.storeMode)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {statusOrder.map((status) => (
          <div
            key={status}
            className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {formatReleaseOrderStatus(status)}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-white">
              {release.byStatus[status]}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          最近发布单
        </p>
        {release.recentOrders.length ? (
          release.recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {order.appName} · {order.version}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                  {order.changeTicket}
                </p>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100">
                {formatReleaseOrderStatus(order.status)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">暂无发布单，登录后可在发布中心创建。</p>
        )}
      </div>

      <Link
        href="/release-center"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-200"
      >
        发布中心
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
