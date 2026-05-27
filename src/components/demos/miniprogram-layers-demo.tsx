"use client";

import { useState } from "react";

const layers = [
  {
    id: "view",
    title: "View 层",
    tech: "WXML / WXS · 自定义组件",
    points: ["页面与组件树", "setData 粒度控制", "skyline / glass-easel 渲染"],
  },
  {
    id: "logic",
    title: "Logic 层",
    tech: "Page / Component 逻辑",
    points: ["生命周期与路由", "分包与预下载", "登录态与权限"],
  },
  {
    id: "service",
    title: "Service 层",
    tech: "云函数 / BFF",
    points: ["REST 聚合", "敏感逻辑不下沉到端", "缓存与错误码统一"],
  },
  {
    id: "bridge",
    title: "Native Bridge",
    tech: "JSBridge · 开放能力",
    points: ["支付 / 扫码 / 定位", "隐私合规弹窗", "版本灰度与降级"],
  },
] as const;

const platforms = [
  { id: "wechat", label: "微信", runtime: "小程序基础库 3.x" },
  { id: "alipay", label: "支付宝", runtime: "小程序 + 插件市场" },
  { id: "douyin", label: "抖音", runtime: "同构需适配 API 差异" },
] as const;

export function MiniprogramLayersDemo() {
  const [activeLayer, setActiveLayer] =
    useState<(typeof layers)[number]["id"]>("view");
  const [platform, setPlatform] =
    useState<(typeof platforms)[number]["id"]>("wechat");

  const layer = layers.find((item) => item.id === activeLayer) ?? layers[0];
  const plat = platforms.find((item) => item.id === platform) ?? platforms[0];

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-slate-400">
        小程序双线程模型：逻辑层与渲染层分离。点击层级查看职责；切换宿主看 API 与发布差异。
      </p>

      <div className="flex flex-wrap gap-2">
        {platforms.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPlatform(item.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              item.id === platform
                ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
                : "border-white/10 text-slate-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="font-mono text-[10px] text-slate-500">{plat.runtime}</p>

      <div className="grid gap-3 md:grid-cols-4">
        {layers.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveLayer(item.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              item.id === activeLayer
                ? "border-emerald-300/35 bg-emerald-300/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">{item.tech}</p>
          </button>
        ))}
      </div>

      <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
          {layer.title}
        </p>
        <ul className="mt-4 space-y-2">
          {layer.points.map((point) => (
            <li key={point} className="flex gap-2 text-sm text-slate-300">
              <span className="text-emerald-300">→</span>
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[10px] text-slate-500">
          跨端：Taro / uni-app / 原生混合 · 设计稿 750rpx
        </p>
      </article>
    </div>
  );
}
