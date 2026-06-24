"use client";

import { useEffect, useMemo } from "react";

import { buildExternalAgentUrl } from "@/lib/external-projects";

export function AgentsExternalRedirect() {
  const href = useMemo(() => {
    if (typeof window === "undefined") {
      return buildExternalAgentUrl();
    }

    const q = new URLSearchParams(window.location.search).get("q") ?? undefined;
    return buildExternalAgentUrl(q);
  }, []);

  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="mx-auto flex min-h-[40vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm text-slate-400">正在跳转到 Home Agent…</p>
      <a href={href} className="text-sm text-cyan-200 hover:text-cyan-100">
        若未自动跳转，请点击这里
      </a>
    </main>
  );
}
