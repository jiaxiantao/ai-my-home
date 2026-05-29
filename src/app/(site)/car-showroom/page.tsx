"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import type { AssetRigCapabilities, CarCameraPreset } from "@/components/car-showroom-scene";
import { Button } from "@/components/ui/button";

const marketCategoryOptions = [
  {
    key: "suv",
    label: "SUV",
    primaryUrl: "/models/market/suv-mainstream.glb",
    fallbackUrl: "/models/cars/car-concept.glb",
    fallbackName: "CarConcept",
  },
  {
    key: "sedan",
    label: "小轿车",
    primaryUrl: "/models/market/sedan-mainstream.glb",
    fallbackUrl: "/models/cars/toy-car.glb",
    fallbackName: "ToyCar",
  },
  {
    key: "offroad",
    label: "越野车",
    primaryUrl: "/models/market/offroad-mainstream.glb",
    fallbackUrl: "/models/cars/cesium-milk-truck.glb",
    fallbackName: "CesiumTruck",
  },
] as const;

type PaintOption = {
  id: string;
  label: string;
  primary: string;
  secondary?: string;
};

const paintOptions: PaintOption[] = [
  { id: "glacier-blue", label: "冰川蓝", primary: "#0ea5e9" },
  { id: "lava-red", label: "熔岩红", primary: "#f43f5e" },
  { id: "forest-green", label: "森野绿", primary: "#22c55e" },
  { id: "star-purple", label: "星幕紫", primary: "#a855f7" },
  { id: "pearl-white", label: "珍珠白", primary: "#e2e8f0" },
  { id: "obsidian-black", label: "曜石黑", primary: "#111827" },
  { id: "sunset-gradient", label: "日落渐变", primary: "#fb7185", secondary: "#f59e0b" },
  { id: "aurora-gradient", label: "极光渐变", primary: "#06b6d4", secondary: "#8b5cf6" },
] as const;

const CarShowroomScene = dynamic(
  () => import("@/components/car-showroom-scene").then((mod) => mod.CarShowroomScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-4xl border border-white/10 bg-slate-950/70 text-sm text-slate-400">
        加载 3D 看车场景...
      </div>
    ),
  },
);

export default function CarShowroomPage() {
  const [leftDoorOpen, setLeftDoorOpen] = useState(false);
  const [rightDoorOpen, setRightDoorOpen] = useState(false);
  const [trunkOpen, setTrunkOpen] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const [seatDriverOffset, setSeatDriverOffset] = useState(0);
  const [seatPassengerOffset, setSeatPassengerOffset] = useState(0);
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<CarCameraPreset>("overview");
  const [hazardOn, setHazardOn] = useState(false);
  const [sunroofOpen, setSunroofOpen] = useState(false);
  const [autoTour, setAutoTour] = useState(false);
  const [selectedPaintId, setSelectedPaintId] = useState<(typeof paintOptions)[number]["id"]>(
    "glacier-blue",
  );
  const [useAssetModel, setUseAssetModel] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof marketCategoryOptions)[number]["key"]
  >("suv");
  const [selectedModelUrl, setSelectedModelUrl] = useState<string>(
    marketCategoryOptions[0].fallbackUrl,
  );
  const [selectedModelLabel, setSelectedModelLabel] = useState<string>(
    `${marketCategoryOptions[0].label}（回退：${marketCategoryOptions[0].fallbackName}）`,
  );
  const [speedKph, setSpeedKph] = useState(28);
  const [braking, setBraking] = useState(false);
  const [assetRigCaps, setAssetRigCaps] = useState<AssetRigCapabilities | null>(null);

  useEffect(() => {
    const category = marketCategoryOptions.find((item) => item.key === selectedCategory);
    if (!category) {
      return;
    }
    let active = true;
    void fetch(category.primaryUrl, { method: "HEAD" })
      .then((response) => (response.ok ? category.primaryUrl : category.fallbackUrl))
      .catch(() => category.fallbackUrl)
      .then((url) => {
        if (!active) {
          return;
        }
        setSelectedModelUrl(url);
        setSelectedModelLabel(
          url === category.primaryUrl
            ? `${category.label}（主流实车模型）`
            : `${category.label}（回退：${category.fallbackName}）`,
        );
      });
    return () => {
      active = false;
    };
  }, [selectedCategory]);

  const selectedPaint = useMemo(
    () => paintOptions.find((paint) => paint.id === selectedPaintId) ?? paintOptions[0],
    [selectedPaintId],
  );

  const sceneState = useMemo(
    () => ({
      leftDoorOpen,
      rightDoorOpen,
      trunkOpen,
      lightsOn,
      engineOn,
      seatDriverOffset,
      seatPassengerOffset,
      steeringAngle,
      hazardOn,
      sunroofOpen,
      bodyColor: selectedPaint.primary,
      bodyColorSecondary: selectedPaint.secondary ?? null,
      speedKph,
      braking,
    }),
    [
      engineOn,
      leftDoorOpen,
      lightsOn,
      rightDoorOpen,
      seatDriverOffset,
      seatPassengerOffset,
      steeringAngle,
      hazardOn,
      sunroofOpen,
      selectedPaint,
      speedKph,
      braking,
      trunkOpen,
    ],
  );

  function applyWelcomeMode() {
    setLeftDoorOpen(true);
    setRightDoorOpen(true);
    setTrunkOpen(false);
    setLightsOn(true);
    setEngineOn(false);
    setSteeringAngle(0);
    setHazardOn(true);
    setSunroofOpen(false);
    setSpeedKph(0);
    setBraking(false);
    setCameraPreset("overview");
    setAutoTour(false);
  }

  function applyDriveMode() {
    setLeftDoorOpen(false);
    setRightDoorOpen(false);
    setTrunkOpen(false);
    setLightsOn(true);
    setEngineOn(true);
    setSteeringAngle(-16);
    setHazardOn(false);
    setSunroofOpen(false);
    setSpeedKph(45);
    setBraking(false);
    setCameraPreset("side-right");
    setAutoTour(false);
  }

  function resetAll() {
    setLeftDoorOpen(false);
    setRightDoorOpen(false);
    setTrunkOpen(false);
    setLightsOn(false);
    setEngineOn(false);
    setSeatDriverOffset(0);
    setSeatPassengerOffset(0);
    setSteeringAngle(0);
    setHazardOn(false);
    setSunroofOpen(false);
    setCameraPreset("overview");
    setAutoTour(false);
    setSelectedPaintId("glacier-blue");
    setSpeedKph(28);
    setBraking(false);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-10 lg:px-8 lg:py-14">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Three.js Demo</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          3D 看车交互舱
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">
          支持开关车门、后备箱、灯光，启动车辆动态效果、主副驾座椅独立调节、方向盘转向，以及视角预设切换。
          可通过下方面板或直接点击 3D 模型中的车门/后备箱完成交互。
        </p>
      </section>

      <CarShowroomScene
        state={sceneState}
        cameraPreset={cameraPreset}
        autoTour={autoTour}
        useAssetModel={useAssetModel}
        modelUrl={selectedModelUrl}
        onAssetRigCapabilities={setAssetRigCaps}
        onToggleLeftDoor={() => setLeftDoorOpen((value) => !value)}
        onToggleRightDoor={() => setRightDoorOpen((value) => !value)}
        onToggleTrunk={() => setTrunkOpen((value) => !value)}
      />

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={useAssetModel ? "default" : "outline"}
            onClick={() => setUseAssetModel((value) => !value)}
          >
            {useAssetModel ? "使用几何体车模" : "尝试加载 GLB 车模"}
          </Button>
          {marketCategoryOptions.map((model) => (
            <Button
              key={model.key}
              variant={selectedCategory === model.key ? "default" : "outline"}
              onClick={() => {
                setSelectedCategory(model.key);
                setUseAssetModel(true);
              }}
            >
              {model.label}
            </Button>
          ))}
          <p className="text-xs text-slate-400">
            当前模型：{selectedModelLabel || "加载中..."}。你可将主流车型放到
            `public/models/market/suv-mainstream.glb` / `sedan-mainstream.glb` /
            `offroad-mainstream.glb`，页面会自动优先加载。
          </p>
          {useAssetModel && assetRigCaps ? (
            <p className="w-full text-xs text-slate-500">
              GLB 部件识别：左前门 {assetRigCaps.leftDoor ? "✓" : "—"} · 右前门{" "}
              {assetRigCaps.rightDoor ? "✓" : "—"} · 后备箱 {assetRigCaps.trunk ? "✓" : "—"} · 车灯{" "}
              {assetRigCaps.headLights ? "✓" : "—"} · 尾灯 {assetRigCaps.tailLights ? "✓" : "—"} ·
              天窗 {assetRigCaps.sunroof ? "✓" : "—"} · 车轮 {assetRigCaps.wheels ? "✓" : "—"}
              {assetRigCaps.leftDoor ? "" : "（未识别到的部件可在 docs/market-glb-rig.md 手动配置）"}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={cameraPreset === "overview" ? "default" : "outline"}
            onClick={() => {
              setCameraPreset("overview");
              setAutoTour(false);
            }}
          >
            全景视角
          </Button>
          <Button
            variant={cameraPreset === "front" ? "default" : "outline"}
            onClick={() => {
              setCameraPreset("front");
              setAutoTour(false);
            }}
          >
            前脸视角
          </Button>
          <Button
            variant={cameraPreset === "side-left" ? "default" : "outline"}
            onClick={() => {
              setCameraPreset("side-left");
              setAutoTour(false);
            }}
          >
            左侧视角
          </Button>
          <Button
            variant={cameraPreset === "side-right" ? "default" : "outline"}
            onClick={() => {
              setCameraPreset("side-right");
              setAutoTour(false);
            }}
          >
            右侧视角
          </Button>
          <Button
            variant={cameraPreset === "rear" ? "default" : "outline"}
            onClick={() => {
              setCameraPreset("rear");
              setAutoTour(false);
            }}
          >
            车尾视角
          </Button>
          <Button
            variant={cameraPreset === "cockpit" ? "default" : "outline"}
            onClick={() => {
              setCameraPreset("cockpit");
              setAutoTour(false);
            }}
          >
            驾舱视角
          </Button>
          <Button
            variant={autoTour ? "default" : "outline"}
            onClick={() => setAutoTour((value) => !value)}
          >
            {autoTour ? "停止环车巡检" : "自动环车巡检"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={leftDoorOpen ? "default" : "outline"}
            onClick={() => setLeftDoorOpen((value) => !value)}
          >
            {leftDoorOpen ? "关闭左前门" : "打开左前门"}
          </Button>
          <Button
            variant={rightDoorOpen ? "default" : "outline"}
            onClick={() => setRightDoorOpen((value) => !value)}
          >
            {rightDoorOpen ? "关闭右前门" : "打开右前门"}
          </Button>
          <Button
            variant={trunkOpen ? "default" : "outline"}
            onClick={() => setTrunkOpen((value) => !value)}
          >
            {trunkOpen ? "关闭后备箱" : "打开后备箱"}
          </Button>
          <Button
            variant={lightsOn ? "default" : "outline"}
            onClick={() => setLightsOn((value) => !value)}
          >
            {lightsOn ? "关闭车灯" : "开启车灯"}
          </Button>
          <Button
            variant={engineOn ? "default" : "outline"}
            onClick={() => setEngineOn((value) => !value)}
          >
            {engineOn ? "熄火" : "启动车辆"}
          </Button>
          <Button
            variant={hazardOn ? "default" : "outline"}
            onClick={() => setHazardOn((value) => !value)}
          >
            {hazardOn ? "关闭双闪" : "开启双闪"}
          </Button>
          <Button
            variant={sunroofOpen ? "default" : "outline"}
            onClick={() => setSunroofOpen((value) => !value)}
          >
            {sunroofOpen ? "关闭天窗" : "打开天窗"}
          </Button>
        </div>

        <div className="grid gap-3">
          <label htmlFor="driver-seat-offset" className="text-sm font-medium text-slate-100">
            主驾座椅：{seatDriverOffset > 0 ? "向后" : seatDriverOffset < 0 ? "向前" : "中间"}
          </label>
          <input
            id="driver-seat-offset"
            type="range"
            min={-45}
            max={45}
            value={Math.round(seatDriverOffset * 100)}
            onChange={(event) => setSeatDriverOffset(Number(event.target.value) / 100)}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
          />
          <label htmlFor="passenger-seat-offset" className="text-sm font-medium text-slate-100">
            副驾座椅：
            {seatPassengerOffset > 0 ? "向后" : seatPassengerOffset < 0 ? "向前" : "中间"}
          </label>
          <input
            id="passenger-seat-offset"
            type="range"
            min={-45}
            max={45}
            value={Math.round(seatPassengerOffset * 100)}
            onChange={(event) => setSeatPassengerOffset(Number(event.target.value) / 100)}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
          />
          <label htmlFor="steering-angle" className="text-sm font-medium text-slate-100">
            方向盘角度：{steeringAngle > 0 ? `右转 ${steeringAngle}°` : steeringAngle < 0 ? `左转 ${Math.abs(steeringAngle)}°` : "居中"}
          </label>
          <input
            id="steering-angle"
            type="range"
            min={-42}
            max={42}
            value={Math.round(steeringAngle)}
            onChange={(event) => setSteeringAngle(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
          />
          <label htmlFor="speed-kph" className="text-sm font-medium text-slate-100">
            目标车速：{speedKph} km/h
          </label>
          <input
            id="speed-kph"
            type="range"
            min={0}
            max={120}
            value={speedKph}
            onChange={(event) => setSpeedKph(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {paintOptions.map((paint) => (
            <Button
              key={paint.id}
              variant={selectedPaintId === paint.id ? "default" : "outline"}
              onClick={() => setSelectedPaintId(paint.id)}
            >
              {paint.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={applyWelcomeMode}>
            迎宾模式
          </Button>
          <Button variant="secondary" onClick={applyDriveMode}>
            驾驶预备模式
          </Button>
          <Button
            variant={braking ? "default" : "outline"}
            onClick={() => setBraking((value) => !value)}
          >
            {braking ? "松开制动" : "模拟制动"}
          </Button>
          <Button variant="outline" onClick={resetAll}>
            复位全部状态
          </Button>
          <p className="text-xs text-slate-400">
            提示：双闪会联动车尾灯闪烁，环车巡检会自动锁定镜头轨迹；如需手动拖拽观察，请先停止巡检。
          </p>
        </div>
      </section>
    </main>
  );
}
