import Link from "next/link";
import { ArrowRight, GitBranch, ShieldCheck } from "lucide-react";

const pipelineStages = [
  { label: "Build", detail: "产物构建" },
  { label: "Test", detail: "Unit + E2E" },
  { label: "Pre", detail: "预发验证" },
  { label: "Prod", detail: "审批 + 窗口" },
] as const;

export function ReleaseCenterSpotlight() {
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
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <GitBranch className="h-3.5 w-3.5 text-cyan-200" />
            发布单状态机
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
            变更单 + 审批元信息
          </span>
        </div>
        <Link
          href="/release-center"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          打开发布中心
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3">
        {pipelineStages.map((stage, index) => (
          <div
            key={stage.label}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{stage.label}</p>
              <p className="text-xs text-slate-400">{stage.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
