"use client";

import { useEffect } from "react";

type StaticExportRedirectProps = {
  href: string;
  label?: string;
};

export function StaticExportRedirect({
  href,
  label = "正在跳转…",
}: StaticExportRedirectProps) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="mx-auto flex min-h-[40vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm text-slate-400">{label}</p>
      <a href={href} className="text-sm text-cyan-200 hover:text-cyan-100">
        若未自动跳转，请点击这里
      </a>
    </main>
  );
}
