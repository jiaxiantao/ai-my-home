"use client";

import { useRef, useState, type PropsWithChildren, type PointerEvent } from "react";

type SpotlightCardProps = PropsWithChildren<{
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}>;

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(103, 232, 249, 0.22)",
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [opacity, setOpacity] = useState(0);

  function updatePointerPosition(event: PointerEvent<HTMLDivElement>) {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    element.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={updatePointerPosition}
      onPointerEnter={() => setOpacity(1)}
      onPointerLeave={() => setOpacity(0)}
      onFocus={() => setOpacity(1)}
      onBlur={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ease-out"
        style={{
          opacity,
          background: `radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${spotlightColor}, transparent 72%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
