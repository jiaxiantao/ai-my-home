"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WeatherType } from "@cos-design/weather-background";

export type MoodBackdropKind = "weather" | "ripple";

export type RippleMoodConfig = {
  fromColor?: string;
  toColor?: string;
  color?: string;
  waveAmplitude?: number;
  waveSpeed?: number;
  shimmer?: number;
  reflection?: number;
};

export type MoodOption = {
  id: string;
  label: string;
  description: string;
  kind: MoodBackdropKind;
  weather?: WeatherType;
  live?: boolean;
  night?: boolean;
  ripple?: RippleMoodConfig;
};

/** 心情 → 背景：天气场景 + 水波纹场景 */
export const MOOD_OPTIONS: MoodOption[] = [
  { id: "cheerful", label: "开心", description: "大晴天", kind: "weather", weather: "sunny" },
  { id: "calm", label: "平静", description: "多云", kind: "weather", weather: "partlyCloudy" },
  { id: "melancholy", label: "阴郁", description: "阴天", kind: "weather", weather: "overcast" },
  { id: "soft", label: "伤感", description: "小雨", kind: "weather", weather: "lightRain" },
  { id: "downcast", label: "低落", description: "中雨", kind: "weather", weather: "moderateRain" },
  { id: "heavy", label: "沉重", description: "大雨", kind: "weather", weather: "heavyRain" },
  { id: "stormy", label: "激动", description: "雷阵雨", kind: "weather", weather: "thunderstorm" },
  { id: "misty", label: "迷茫", description: "雾", kind: "weather", weather: "fog" },
  { id: "chilly", label: "清冷", description: "小雪", kind: "weather", weather: "lightSnow" },
  { id: "quiet", label: "静谧", description: "中雪", kind: "weather", weather: "moderateSnow" },
  { id: "lonely", label: "孤寂", description: "大雪", kind: "weather", weather: "heavySnow" },
  { id: "torn", label: "纠结", description: "雨夹雪", kind: "weather", weather: "sleet" },
  { id: "burst", label: "爆发", description: "冰雹", kind: "weather", weather: "hail" },
  { id: "oppressed", label: "压抑", description: "霾", kind: "weather", weather: "smog" },
  { id: "fierce", label: "躁动", description: "大风", kind: "weather", weather: "gale" },
  {
    id: "live",
    label: "随缘",
    description: "实时天气",
    kind: "weather",
    weather: "partlyCloudy",
    live: true,
  },
  {
    id: "night",
    label: "夜静",
    description: "夜间模式",
    kind: "weather",
    weather: "overcast",
    night: true,
  },
  {
    id: "ripple-clear",
    label: "澄澈",
    description: "水波纹",
    kind: "ripple",
    ripple: {
      fromColor: "#52ade3",
      toColor: "#013565",
      color: "#a8d8f5",
      waveAmplitude: 1,
      waveSpeed: 1,
      shimmer: 1,
      reflection: 0.38,
    },
  },
  {
    id: "ripple-deep",
    label: "深潜",
    description: "深海水波",
    kind: "ripple",
    ripple: {
      fromColor: "#1a4a6e",
      toColor: "#020b18",
      color: "#6eb6d9",
      waveAmplitude: 1.2,
      waveSpeed: 0.7,
      shimmer: 0.7,
      reflection: 0.45,
    },
  },
  {
    id: "ripple-dusk",
    label: "暮潮",
    description: "暮色水波",
    kind: "ripple",
    ripple: {
      fromColor: "#7a5a9e",
      toColor: "#1a1030",
      color: "#d4b8f0",
      waveAmplitude: 0.9,
      waveSpeed: 0.85,
      shimmer: 1.2,
      reflection: 0.42,
    },
  },
  {
    id: "ripple-jade",
    label: "碧波",
    description: "青绿水波",
    kind: "ripple",
    ripple: {
      fromColor: "#3db8a0",
      toColor: "#05352c",
      color: "#9eefe0",
      waveAmplitude: 1.1,
      waveSpeed: 1.15,
      shimmer: 1.1,
      reflection: 0.4,
    },
  },
];

const DEFAULT_MOOD_ID = "stormy";

type WeatherMoodContextValue = {
  moodId: string;
  mood: MoodOption;
  kind: MoodBackdropKind;
  weather: WeatherType;
  live: boolean;
  night: boolean;
  ripple: RippleMoodConfig | null;
  setMoodId: (moodId: string) => void;
};

const WeatherMoodContext = createContext<WeatherMoodContextValue | null>(null);

function resolveMood(moodId: string): MoodOption {
  return (
    MOOD_OPTIONS.find((option) => option.id === moodId) ??
    MOOD_OPTIONS.find((option) => option.id === DEFAULT_MOOD_ID)!
  );
}

export function WeatherMoodProvider({ children }: { children: ReactNode }) {
  const [moodId, setMoodIdState] = useState(DEFAULT_MOOD_ID);

  function setMoodId(nextMoodId: string) {
    if (!MOOD_OPTIONS.some((option) => option.id === nextMoodId)) {
      return;
    }
    setMoodIdState(nextMoodId);
  }

  const mood = resolveMood(moodId);

  const value = useMemo<WeatherMoodContextValue>(
    () => ({
      moodId: mood.id,
      mood,
      kind: mood.kind,
      weather: mood.weather ?? "thunderstorm",
      live: Boolean(mood.live),
      night: Boolean(mood.night),
      ripple: mood.kind === "ripple" ? (mood.ripple ?? {}) : null,
      setMoodId,
    }),
    [mood],
  );

  return (
    <WeatherMoodContext.Provider value={value}>{children}</WeatherMoodContext.Provider>
  );
}

export function useWeatherMood() {
  const context = useContext(WeatherMoodContext);
  if (!context) {
    throw new Error("useWeatherMood must be used within WeatherMoodProvider");
  }
  return context;
}
