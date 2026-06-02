"use client";

import { usePathname } from "next/navigation";

import { ParticleBackground } from "@/components/particle-background";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showParticles = pathname === "/";

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[#020617] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_28%),linear-gradient(180deg,#020617_0%,#020817_55%,#020617_100%)]"
      />
      {showParticles ? <ParticleBackground /> : null}
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </>
  );
}
