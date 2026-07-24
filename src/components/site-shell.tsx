"use client";

import { usePathname } from "next/navigation";

import { WeatherBackdrop } from "@/components/weather-backdrop";
import {
  WeatherMoodProvider,
  useWeatherMood,
} from "@/components/weather-mood-provider";

function SiteShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { kind, weather, live, night, ripple, smoke } = useWeatherMood();
  const isPrintRoute = pathname.startsWith("/resume/print");

  return (
    <>
      {!isPrintRoute ? (
        <WeatherBackdrop
          kind={kind}
          weather={weather}
          live={live}
          night={night}
          ripple={ripple}
          smoke={smoke}
        />
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
