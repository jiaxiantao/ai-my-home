"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const particleCount = 96;
const linkDistance = 160;

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const context2d = canvasElement?.getContext("2d");

    if (!canvasElement || !context2d) {
      return;
    }

    const canvasEl: HTMLCanvasElement = canvasElement;
    const ctx: CanvasRenderingContext2D = context2d;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let animationId = 0;
    let width = 0;
    let height = 0;
    const particles: Particle[] = [];
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedParticles() {
      particles.length = 0;

      for (let index = 0; index < particleCount; index += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.45),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0 : 0.45),
          radius: 1.2 + Math.random() * 2,
        });
      }
    }

    function draw() {
      if (prefersReducedMotion) {
        ctx.clearRect(0, 0, width, height);
        for (const particle of particles) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 211, 238, 0.65)";
          ctx.fill();
        }
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        if (!prefersReducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > width) {
            particle.vx *= -1;
          }

          if (particle.y < 0 || particle.y > height) {
            particle.vy *= -1;
          }
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 211, 238, 0.85)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);

          if (distance > linkDistance) {
            continue;
          }

          const alpha = (1 - distance / linkDistance) * 0.45;
          ctx.strokeStyle = `rgba(103, 232, 249, ${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (!prefersReducedMotion) {
        animationId = window.requestAnimationFrame(draw);
      }
    }

    resize();
    seedParticles();
    draw();

    if (prefersReducedMotion) {
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    const onResize = () => {
      resize();
      seedParticles();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}
