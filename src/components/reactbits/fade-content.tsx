"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";

import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type FadeContentProps = {
  children: ReactNode;
  className?: string;
  blur?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
};

export function FadeContent({
  children,
  className,
  blur = 10,
  duration = 0.45,
  delay = 0,
  once = true,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, amount: 0.15 });
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, filter: `blur(${blur}px)` }}
      animate={inView ? { opacity: 1, filter: "blur(0px)" } : undefined}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
