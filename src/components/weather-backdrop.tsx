"use client";

import { useEffect, useState } from "react";
import { WeatherBackground, type WeatherType } from "@cos-design/weather-background";

type WeatherBackdropProps = {
  weather?: WeatherType;
  live?: boolean;
  night?: boolean;
};

type Size = { width: number; height: number };

export function WeatherBackdrop({
  weather = "thunderstorm",
  live = false,
  night = false,
}: WeatherBackdropProps) {
  const [size, setSize] = useState<Size | null>(null);

  useEffect(() => {
    const update = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      data-weather-backdrop
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#252f42]"
    >
      {size ? (
        <WeatherBackground
          width={size.width}
          height={size.height}
          weather={weather}
          live={live}
          night={night}
        />
      ) : null}
    </div>
  );
}
