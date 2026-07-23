"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WeatherType } from "@cos-design/weather-background";

export type MoodOption = {
  id: string;
  label: string;
  description: string;
  weather: WeatherType;
  live?: boolean;
  night?: boolean;
};

/** 心情 → 天气：覆盖 WeatherBackground 全部场景 + 实时 / 夜间 */
export const MOOD_OPTIONS: MoodOption[] = [
  { id: "cheerful", label: "开心", description: "大晴天", weather: "sunny" },
  { id: "calm", label: "平静", description: "多云", weather: "partlyCloudy" },
  { id: "melancholy", label: "阴郁", description: "阴天", weather: "overcast" },
  { id: "soft", label: "伤感", description: "小雨", weather: "lightRain" },
  { id: "downcast", label: "低落", description: "中雨", weather: "moderateRain" },
  { id: "heavy", label: "沉重", description: "大雨", weather: "heavyRain" },
  { id: "stormy", label: "激动", description: "雷阵雨", weather: "thunderstorm" },
  { id: "misty", label: "迷茫", description: "雾", weather: "fog" },
  { id: "chilly", label: "清冷", description: "小雪", weather: "lightSnow" },
  { id: "quiet", label: "静谧", description: "中雪", weather: "moderateSnow" },
  { id: "lonely", label: "孤寂", description: "大雪", weather: "heavySnow" },
  { id: "torn", label: "纠结", description: "雨夹雪", weather: "sleet" },
  { id: "burst", label: "爆发", description: "冰雹", weather: "hail" },
  { id: "oppressed", label: "压抑", description: "霾", weather: "smog" },
  { id: "fierce", label: "躁动", description: "大风", weather: "gale" },
  {
    id: "live",
    label: "随缘",
    description: "实时天气",
    weather: "partlyCloudy",
    live: true,
  },
  {
    id: "night",
    label: "夜静",
    description: "夜间模式",
    weather: "overcast",
    night: true,
  },
];

const DEFAULT_MOOD_ID = "stormy";

type WeatherMoodContextValue = {
  moodId: string;
  mood: MoodOption;
  weather: WeatherType;
  live: boolean;
  night: boolean;
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
      weather: mood.weather,
      live: Boolean(mood.live),
      night: Boolean(mood.night),
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
