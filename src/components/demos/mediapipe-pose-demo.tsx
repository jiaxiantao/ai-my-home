"use client";

import { useEffect, useRef, useState } from "react";

import type { PoseLandmarker } from "@mediapipe/tasks-vision";

type PoseStatus = "idle" | "loading" | "running" | "error";

export function MediapipePoseDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number>(0);

  const [status, setStatus] = useState<PoseStatus>("idle");
  const [fps, setFps] = useState(0);
  const [landmarkCount, setLandmarkCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      const stream = video?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startPose() {
    setError(null);
    setStatus("loading");

    try {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      landmarkerRef.current = landmarker;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 360 },
        audio: false,
      });

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        throw new Error("视频元素未就绪");
      }

      video.srcObject = stream;
      await video.play();

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas 不可用");
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      setStatus("running");
      let lastTick = performance.now();
      let frames = 0;

      const render = () => {
        if (!landmarkerRef.current || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(render);
          return;
        }

        const result = landmarkerRef.current.detectForVideo(video, performance.now());

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const points = result.landmarks?.[0] ?? [];
        setLandmarkCount(points.length);

        context.fillStyle = "rgba(34, 211, 238, 0.95)";

        for (const point of points) {
          if ((point.visibility ?? 1) < 0.35) {
            continue;
          }

          context.beginPath();
          context.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
          context.fill();
        }

        frames += 1;
        const now = performance.now();

        if (now - lastTick >= 1000) {
          setFps(frames);
          frames = 0;
          lastTick = now;
        }

        rafRef.current = requestAnimationFrame(render);
      };

      rafRef.current = requestAnimationFrame(render);
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "无法启动摄像头或 MediaPipe（需 HTTPS 或 localhost）",
      );
    }
  }

  function stopPose() {
    cancelAnimationFrame(rafRef.current);
    landmarkerRef.current?.close();
    landmarkerRef.current = null;

    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus("idle");
    setFps(0);
    setLandmarkCount(0);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-400">
        MediaPipe Tasks Vision 在浏览器内做{" "}
        <span className="text-cyan-200/90">姿势估计</span>，默认尝试 GPU delegate；
        模型与 WASM 从 CDN 加载，适合零后端延迟的体感交互。
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void startPose()}
          disabled={status === "loading" || status === "running"}
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          {status === "loading" ? "初始化…" : "开启摄像头 + Pose"}
        </button>
        <button
          type="button"
          onClick={stopPose}
          disabled={status !== "running"}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
        >
          停止
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="h-auto w-full max-h-[360px] object-contain" />
        {status !== "running" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm text-slate-400">
            {status === "error" ? error : "预览区 · 点击上方按钮启动"}
          </div>
        ) : null}
      </div>

      {status === "running" ? (
        <p className="font-mono text-xs text-slate-500">
          ~{fps} FPS · 关键点 {landmarkCount}
        </p>
      ) : null}

      {error && status !== "running" ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}
