"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

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
  const [seatOffset, setSeatOffset] = useState(0);

  const sceneState = useMemo(
    () => ({
      leftDoorOpen,
      rightDoorOpen,
      trunkOpen,
      lightsOn,
      engineOn,
      seatOffset,
    }),
    [engineOn, leftDoorOpen, lightsOn, rightDoorOpen, seatOffset, trunkOpen],
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-10 lg:px-8 lg:py-14">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Three.js Demo</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          3D 看车交互舱
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">
          支持开关车门、后备箱、灯光，启动车辆动态效果，以及座椅前后调节。可通过下方面板或直接点击 3D
          模型中的车门/后备箱完成交互。
        </p>
      </section>

      <CarShowroomScene
        state={sceneState}
        onToggleLeftDoor={() => setLeftDoorOpen((value) => !value)}
        onToggleRightDoor={() => setRightDoorOpen((value) => !value)}
        onToggleTrunk={() => setTrunkOpen((value) => !value)}
      />

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
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
        </div>

        <div className="grid gap-2">
          <label htmlFor="seat-offset" className="text-sm font-medium text-slate-100">
            座椅调节：{seatOffset > 0 ? "向后" : seatOffset < 0 ? "向前" : "中间"}
          </label>
          <input
            id="seat-offset"
            type="range"
            min={-45}
            max={45}
            value={Math.round(seatOffset * 100)}
            onChange={(event) => setSeatOffset(Number(event.target.value) / 100)}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
          />
          <p className="text-xs text-slate-400">
            提示：启动车辆后可看到车轮转动和车身轻微抖动，模拟车辆通电状态。
          </p>
        </div>
      </section>
    </main>
  );
}
