"use client";

import { useEffect, useRef, useState } from "react";
import { RippleWater } from "@cos-design/ripple-water";
import { SmokeFog } from "@cos-design/smoke-fog";
import { WeatherBackground, type WeatherType } from "@cos-design/weather-background";

import type {
  MoodBackdropKind,
  RippleMoodConfig,
  SmokeMoodConfig,
} from "@/components/weather-mood-provider";

type WeatherBackdropProps = {
  kind?: MoodBackdropKind;
  weather?: WeatherType;
  live?: boolean;
  night?: boolean;
  ripple?: RippleMoodConfig | null;
  smoke?: SmokeMoodConfig | null;
};

type Size = { width: number; height: number };

const UI_TARGET_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "option",
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="slider"]',
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[contenteditable="true"]',
  "[data-no-ripple]",
  "[data-no-backdrop-interact]",
  "header",
  "nav",
].join(",");

function isUiTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return true;
  }
  return Boolean(target.closest(UI_TARGET_SELECTOR));
}

function dispatchBackdropPointer(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  type: "pointerdown" | "click",
) {
  const common = {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
    view: window,
    button: 0,
  } as const;

  if (type === "pointerdown") {
    // SmokeFog listens to pointerdown on its canvas.
    canvas.dispatchEvent(
      new PointerEvent("pointerdown", {
        ...common,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        buttons: 1,
      }),
    );
    return;
  }

  // RippleWater listens to click / touchstart on its canvas.
  canvas.dispatchEvent(new MouseEvent("click", common));
}

export function WeatherBackdrop({
  kind = "weather",
  weather = "thunderstorm",
  live = false,
  night = false,
  ripple = null,
  smoke = null,
}: WeatherBackdropProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const isRipple = kind === "ripple";
  const isSmoke = kind === "smoke";

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

  // Backdrop stays pointer-events-none so page scroll/UI keep working.
  // Forward blank-area presses to the canvas:
  // - pointerdown → SmokeFog disperse
  // - click (on pointerup without drag) → RippleWater ripples
  useEffect(() => {
    function getCanvas() {
      return rootRef.current?.querySelector("canvas") ?? null;
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      if (isUiTarget(event.target)) {
        pointerStartRef.current = null;
        return;
      }

      pointerStartRef.current = { x: event.clientX, y: event.clientY };

      const canvas = getCanvas();
      if (!canvas) {
        return;
      }
      dispatchBackdropPointer(canvas, event.clientX, event.clientY, "pointerdown");
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start) {
        return;
      }
      const moved =
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8;
      if (moved || isUiTarget(event.target)) {
        return;
      }
      if (window.getSelection()?.toString()) {
        return;
      }

      const canvas = getCanvas();
      if (!canvas) {
        return;
      }
      dispatchBackdropPointer(canvas, event.clientX, event.clientY, "click");
    }

    function onPointerCancel() {
      pointerStartRef.current = null;
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerCancel, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerCancel, true);
    };
  }, [kind]);

  return (
    <div
      ref={rootRef}
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
            interactive
            showHint={false}
          />
        ) : isSmoke ? (
          <SmokeFog
            width={size.width}
            height={size.height}
            density={smoke?.density}
            color={smoke?.color}
            backgroundColor={smoke?.backgroundColor}
            speed={smoke?.speed}
            disperseStrength={smoke?.disperseStrength}
            disperseRadius={smoke?.disperseRadius}
            interactive
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
