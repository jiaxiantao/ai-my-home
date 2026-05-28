"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import type { CarCameraPreset } from "@/components/car-showroom-scene";
import { Button } from "@/components/ui/button";

const carModelOptions = [
  { label: "概念车 CarConcept", value: "/models/cars/car-concept.glb" },
  { label: "牛奶卡车 Cesium", value: "/models/cars/cesium-milk-truck.glb" },
  { label: "玩具车 ToyCar", value: "/models/cars/toy-car.glb" },
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
  const [bodyColor, setBodyColor] = useState("#0ea5e9");
  const [useAssetModel, setUseAssetModel] = useState(true);
  const [selectedModelUrl, setSelectedModelUrl] = useState<string>(
    carModelOptions[0].value,
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
      bodyColor,
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
      bodyColor,
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
    setCameraPreset("side");
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
    setBodyColor("#0ea5e9");
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
          {carModelOptions.map((model) => (
            <Button
              key={model.value}
              variant={selectedModelUrl === model.value ? "default" : "outline"}
              onClick={() => {
                setSelectedModelUrl(model.value);
                setUseAssetModel(true);
              }}
            >
              {model.label}
            </Button>
          ))}
          <p className="text-xs text-slate-400">
            已内置 3 个在线下载车型到 `public/models/cars`，可直接切换演示。
          </p>
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
            variant={cameraPreset === "side" ? "default" : "outline"}
            onClick={() => {
              setCameraPreset("side");
              setAutoTour(false);
            }}
          >
            侧面视角
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
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={bodyColor === "#0ea5e9" ? "default" : "outline"}
            onClick={() => setBodyColor("#0ea5e9")}
          >
            冰川蓝
          </Button>
          <Button
            variant={bodyColor === "#f43f5e" ? "default" : "outline"}
            onClick={() => setBodyColor("#f43f5e")}
          >
            熔岩红
          </Button>
          <Button
            variant={bodyColor === "#22c55e" ? "default" : "outline"}
            onClick={() => setBodyColor("#22c55e")}
          >
            森野绿
          </Button>
          <Button
            variant={bodyColor === "#a855f7" ? "default" : "outline"}
            onClick={() => setBodyColor("#a855f7")}
          >
            星幕紫
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={applyWelcomeMode}>
            迎宾模式
          </Button>
          <Button variant="secondary" onClick={applyDriveMode}>
            驾驶预备模式
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
