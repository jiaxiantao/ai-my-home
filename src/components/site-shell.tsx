"use client";

import { usePathname } from "next/navigation";

import { WeatherBackdrop } from "@/components/weather-backdrop";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrintRoute = pathname.startsWith("/resume/print");

  return (
    <>
      {!isPrintRoute ? <WeatherBackdrop /> : null}
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </>
  );
}
