"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

type MagnetProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  wrapperClassName?: string;
  innerClassName?: string;
};

export function Magnet({
  children,
  padding = 90,
  disabled = false,
  magnetStrength = 2.2,
  wrapperClassName = "",
  innerClassName = "",
  ...props
}: MagnetProps) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (disabled) {
        return;
      }

      const element = magnetRef.current;
      if (!element) {
        return;
      }

      const { left, top, width, height } = element.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = Math.abs(centerX - event.clientX);
      const distY = Math.abs(centerY - event.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        setPosition({
          x: (event.clientX - centerX) / magnetStrength,
          y: (event.clientY - centerY) / magnetStrength,
        });
        return;
      }

      setIsActive(false);
      setPosition({ x: 0, y: 0 });
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [disabled, magnetStrength, padding]);

  const visualPosition = disabled ? { x: 0, y: 0 } : position;
  const visualIsActive = disabled ? false : isActive;

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{ position: "relative", display: "inline-block" }}
      {...props}
    >
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${visualPosition.x}px, ${visualPosition.y}px, 0)`,
          transition: visualIsActive
            ? "transform 0.22s ease-out"
            : "transform 0.38s ease-in-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
