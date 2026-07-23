"use client";

import { usePathname } from "next/navigation";

import { WeatherBackdrop } from "@/components/weather-backdrop";
import {
  WeatherMoodProvider,
  useWeatherMood,
} from "@/components/weather-mood-provider";

function SiteShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { weather, live, night } = useWeatherMood();
  const isPrintRoute = pathname.startsWith("/resume/print");

  return (
    <>
      {!isPrintRoute ? (
        <WeatherBackdrop weather={weather} live={live} night={night} />
      ) : null}
      <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
    </>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <WeatherMoodProvider>
      <SiteShellContent>{children}</SiteShellContent>
    </WeatherMoodProvider>
  );
}
