"use client";

import { useEffect, useState } from "react";
import { RippleWater } from "@cos-design/ripple-water";
import { WeatherBackground, type WeatherType } from "@cos-design/weather-background";

import type {
  MoodBackdropKind,
  RippleMoodConfig,
} from "@/components/weather-mood-provider";

type WeatherBackdropProps = {
  kind?: MoodBackdropKind;
  weather?: WeatherType;
  live?: boolean;
  night?: boolean;
  ripple?: RippleMoodConfig | null;
};

type Size = { width: number; height: number };

export function WeatherBackdrop({
  kind = "weather",
  weather = "thunderstorm",
  live = false,
  night = false,
  ripple = null,
}: WeatherBackdropProps) {
  const [size, setSize] = useState<Size | null>(null);
  const isRipple = kind === "ripple";

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
      data-mood-kind={kind}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#252f42]"
    >
      {size ? (
        isRipple ? (
          <RippleWater
            width={size.width}
            height={size.height}
            fromColor={ripple?.fromColor}
            toColor={ripple?.toColor}
            color={ripple?.color}
            waveAmplitude={ripple?.waveAmplitude}
            waveSpeed={ripple?.waveSpeed}
            shimmer={ripple?.shimmer}
            reflection={ripple?.reflection}
            interactive={false}
            showHint={false}
          />
        ) : (
          <WeatherBackground
            width={size.width}
            height={size.height}
            weather={weather}
            live={live}
            night={night}
          />
        )
      ) : null}
    </div>
  );
}
