"use client";

import { usePathname } from "next/navigation";

import { ParticleBackground } from "@/components/particle-background";
import { WeatherBackdrop } from "@/components/weather-backdrop";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showParticles = pathname === "/";
  const isPrintRoute = pathname.startsWith("/resume/print");

  return (
    <>
      {!isPrintRoute ? <WeatherBackdrop /> : null}
      {showParticles ? <ParticleBackground /> : null}
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </>
  );
}
