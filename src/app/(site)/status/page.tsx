import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { StatusProbe } from "@/components/status-probe";

export const metadata: Metadata = {
  title: "System Status | XJ / Frontend Systems",
  description:
    "Live diagnostics: database, LLM runtime, pg_trgm search, and API endpoint latency.",
};

const quickLinks = [
  { href: "/api/health", label: "GET /api/health" },
  { href: "/api/profile", label: "GET /api/profile" },
  { href: "/api/dashboard", label: "GET /api/dashboard" },
  { href: "/api/notes/search?q=架构", label: "GET /api/notes/search" },
  { href: "/api/analytics/notes", label: "GET /api/analytics/notes" },
  { href: "/api/chat", label: "POST /api/chat (SSE)" },
];

export default function StatusPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-10 lg:px-8 lg:py-16">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          System Status
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          运行时诊断
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          实时探测 DB 连接、LLM 配置、pg_trgm 扩展，以及各 API 端点的延迟。
          可作为部署后的快速验收入口。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-cyan-100/90 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Diagnostics" title="依赖状态与 API 响应" />
        <StatusProbe />
      </section>
    </main>
  );
}
