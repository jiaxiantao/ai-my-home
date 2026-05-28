"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type CarCameraPreset = "overview" | "front" | "side" | "rear" | "cockpit";

type CarShowroomState = {
  leftDoorOpen: boolean;
  rightDoorOpen: boolean;
  trunkOpen: boolean;
  lightsOn: boolean;
  engineOn: boolean;
  seatDriverOffset: number;
  seatPassengerOffset: number;
  steeringAngle: number;
  hazardOn: boolean;
  sunroofOpen: boolean;
  bodyColor: string;
  speedKph: number;
  braking: boolean;
};

type CarShowroomSceneProps = {
  state: CarShowroomState;
  cameraPreset: CarCameraPreset;
  autoTour: boolean;
  useAssetModel: boolean;
  modelUrl?: string;
  onToggleLeftDoor: () => void;
  onToggleRightDoor: () => void;
  onToggleTrunk: () => void;
};

type CarModelProps = {
  state: CarShowroomState;
  onToggleLeftDoor: () => void;
  onToggleRightDoor: () => void;
  onToggleTrunk: () => void;
  overlayOnly?: boolean;
};

function AssetModel({
  object,
  state,
}: {
  object: THREE.Object3D;
  state: CarShowroomState;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const paintMaterialRefs = useRef<THREE.Material[]>([]);
  const allColorMaterialRefs = useRef<THREE.Material[]>([]);

  useEffect(() => {
    paintMaterialRefs.current = [];
    allColorMaterialRefs.current = [];
    const excludeName = /(wheel|tire|rim|glass|window|light|head|tail|lamp|indicator|interior|seat|mirror|grill|exhaust|brake|caliper|steer|handle)/;
    const includeName = /(body|paint|door|hood|bonnet|fender|bumper|trunk|tailgate|hatch|shell|car)/;
    const candidates = new Map<string, { material: THREE.Material; score: number }>();
    const broadCandidates = new Map<string, { material: THREE.Material; score: number }>();

    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }
      const geometry = mesh.geometry;
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const size = new THREE.Vector3();
      box?.getSize(size);
      const diagonal = size.length();
      const meshName = `${mesh.name} ${mesh.parent?.name ?? ""}`.toLowerCase();
      if (excludeName.test(meshName)) {
        return;
      }

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const entry of materials) {
        if (!("color" in entry)) {
          continue;
        }
        const color = (entry as { color: THREE.Color }).color;
        if (!broadCandidates.has(entry.uuid)) {
          broadCandidates.set(entry.uuid, {
            material: entry,
            score: Math.max(0.001, diagonal),
          });
        }
        const maybeTransparent = (entry as { transparent?: boolean; opacity?: number }).transparent;
        const maybeOpacity = (entry as { opacity?: number }).opacity;
        if (maybeTransparent && typeof maybeOpacity === "number" && maybeOpacity < 0.98) {
          continue;
        }
        const maybeEmissiveIntensity = (entry as { emissiveIntensity?: number }).emissiveIntensity;
        if (typeof maybeEmissiveIntensity === "number" && maybeEmissiveIntensity > 0.15) {
          continue;
        }

        const luma = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        if (luma < 0.1 || luma > 0.95) {
          continue;
        }

        const bonus = includeName.test(meshName) ? 2 : 1;
        const score = Math.max(0.001, diagonal) * bonus;
        const prev = candidates.get(entry.uuid);
        if (!prev || prev.score < score) {
          candidates.set(entry.uuid, { material: entry, score });
        }
      }
    });

    const picked = [...candidates.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((entry) => entry.material);
    paintMaterialRefs.current = picked.length
      ? picked
      : [...broadCandidates.values()]
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((entry) => entry.material);
    allColorMaterialRefs.current = [...broadCandidates.values()].map((entry) => entry.material);
  }, [object]);

  useEffect(() => {
    const target = new THREE.Color(state.bodyColor);
    const targets = paintMaterialRefs.current.length
      ? paintMaterialRefs.current
      : allColorMaterialRefs.current;
    for (const material of targets) {
      if (!("color" in material)) {
        continue;
      }
      (material as { color: THREE.Color }).color.copy(target);
    }
  }, [state.bodyColor]);

  useFrame((renderState, delta) => {
    if (rootRef.current) {
      const t = renderState.clock.getElapsedTime();
      const y = state.engineOn ? Math.sin(t * 8) * 0.02 : 0;
      rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, y, 5, delta);
    }
  });

  return (
    <group ref={rootRef}>
      <primitive object={object} />
    </group>
  );
}

function getCameraPose(preset: CarCameraPreset) {
  if (preset === "front") {
    return {
      position: new THREE.Vector3(-5.6, 1.8, 0),
      target: new THREE.Vector3(-0.8, 0.5, 0),
    };
  }
  if (preset === "side") {
    return {
      position: new THREE.Vector3(0.2, 1.9, 6.3),
      target: new THREE.Vector3(0.1, 0.45, 0),
    };
  }
  if (preset === "rear") {
    return {
      position: new THREE.Vector3(5.9, 1.9, 0),
      target: new THREE.Vector3(1.2, 0.6, 0),
    };
  }
  if (preset === "cockpit") {
    return {
      position: new THREE.Vector3(-0.35, 1.05, 0.3),
      target: new THREE.Vector3(-2, 1.05, 0.3),
    };
  }
  return {
    position: new THREE.Vector3(5.2, 2.4, 4.6),
    target: new THREE.Vector3(0, 0.45, 0),
  };
}

function CameraRig({ preset, autoTour }: { preset: CarCameraPreset; autoTour: boolean }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  useFrame((renderState, delta) => {
    if (!cameraRef.current) {
      return;
    }
    if (autoTour) {
      const t = renderState.clock.getElapsedTime() * 0.22;
      const radius = 6.3;
      const targetY = 0.7 + Math.sin(t * 2) * 0.12;
      const target = new THREE.Vector3(0, 0.48, 0);
      const position = new THREE.Vector3(
        Math.cos(t) * radius,
        2 + targetY,
        Math.sin(t) * radius,
      );
      cameraRef.current.position.lerp(position, THREE.MathUtils.clamp(delta * 2, 0, 1));
      cameraRef.current.lookAt(target);
      return;
    }
    const pose = getCameraPose(preset);
    cameraRef.current.position.lerp(pose.position, THREE.MathUtils.clamp(delta * 2.3, 0, 1));
    cameraRef.current.lookAt(pose.target);
  });
  return <PerspectiveCamera ref={cameraRef} makeDefault fov={45} position={[5.2, 2.4, 4.6]} />;
}

function CarModel({
  state,
  onToggleLeftDoor,
  onToggleRightDoor,
  onToggleTrunk,
  overlayOnly = false,
}: CarModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const trunkRef = useRef<THREE.Group>(null);
  const seatLeftRef = useRef<THREE.Mesh>(null);
  const seatRightRef = useRef<THREE.Mesh>(null);
  const steeringRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const cabinRef = useRef<THREE.Mesh>(null);
  const sunroofRef = useRef<THREE.Mesh>(null);
  const leftHeadLightRef = useRef<THREE.Mesh>(null);
  const rightHeadLightRef = useRef<THREE.Mesh>(null);
  const leftTailLightRef = useRef<THREE.Mesh>(null);
  const rightTailLightRef = useRef<THREE.Mesh>(null);
  const exhaustLeftRef = useRef<THREE.Mesh>(null);
  const exhaustRightRef = useRef<THREE.Mesh>(null);
  const frontSteerRefs = useRef<THREE.Group[]>([]);
  const wheelSpinRefs = useRef<THREE.Mesh[]>([]);
  const velocityRef = useRef(0);
  const lastVelocityRef = useRef(0);

  const wheelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0f172a",
        metalness: 0.25,
        roughness: 0.65,
      }),
    [],
  );
  const hiddenHitboxMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
      }),
    [],
  );

  useFrame((renderState, delta) => {
    const t = renderState.clock.getElapsedTime();
    const hazardBlink = state.hazardOn ? (Math.sin(t * 8) > 0 ? 1 : 0.08) : 0.08;

    if (leftDoorRef.current) {
      const target = state.leftDoorOpen ? Math.PI * 0.62 : 0;
      leftDoorRef.current.rotation.y = THREE.MathUtils.damp(
        leftDoorRef.current.rotation.y,
        target,
        8,
        delta,
      );
    }
    if (rightDoorRef.current) {
      const target = state.rightDoorOpen ? -Math.PI * 0.62 : 0;
      rightDoorRef.current.rotation.y = THREE.MathUtils.damp(
        rightDoorRef.current.rotation.y,
        target,
        8,
        delta,
      );
    }
    if (trunkRef.current) {
      const target = state.trunkOpen ? -Math.PI * 0.6 : 0;
      trunkRef.current.rotation.x = THREE.MathUtils.damp(
        trunkRef.current.rotation.x,
        target,
        7,
        delta,
      );
    }

    const seatDriverTarget = THREE.MathUtils.clamp(state.seatDriverOffset, -0.45, 0.45);
    const seatPassengerTarget = THREE.MathUtils.clamp(state.seatPassengerOffset, -0.45, 0.45);
    if (seatLeftRef.current) {
      seatLeftRef.current.position.z = THREE.MathUtils.damp(
        seatLeftRef.current.position.z,
        0.2 + seatDriverTarget,
        9,
        delta,
      );
    }
    if (seatRightRef.current) {
      seatRightRef.current.position.z = THREE.MathUtils.damp(
        seatRightRef.current.position.z,
        0.2 + seatPassengerTarget,
        9,
        delta,
      );
    }

    const targetVelocity = state.engineOn ? state.speedKph / 3.6 : 0;
    const brakeFactor = state.braking ? 14 : 4;
    velocityRef.current = THREE.MathUtils.damp(
      velocityRef.current,
      targetVelocity,
      brakeFactor,
      delta,
    );

    const wheelRadius = 0.27;
    const angularSpeed = velocityRef.current / wheelRadius;
    for (let index = 0; index < wheelSpinRefs.current.length; index += 1) {
      const wheel = wheelSpinRefs.current[index];
      if (!wheel) {
        continue;
      }
      // Left and right wheels should spin in opposite local directions.
      const sideDirection = index % 2 === 0 ? -1 : 1;
      wheel.rotation.z += delta * angularSpeed * sideDirection;
    }

    const steerInput = THREE.MathUtils.clamp(state.steeringAngle, -42, 42) * (Math.PI / 180);
    const wheelBase = 2.2;
    const trackWidth = 1.48;
    const minSteer = 0.001;
    const steerSign = Math.sign(steerInput);
    let leftSteerTarget = steerInput;
    let rightSteerTarget = steerInput;
    if (Math.abs(steerInput) > minSteer) {
      const turnRadius = wheelBase / Math.tan(Math.abs(steerInput));
      const inner = Math.atan(wheelBase / Math.max(0.2, turnRadius - trackWidth / 2));
      const outer = Math.atan(wheelBase / Math.max(0.2, turnRadius + trackWidth / 2));
      if (steerSign > 0) {
        leftSteerTarget = outer;
        rightSteerTarget = inner;
      } else {
        leftSteerTarget = -inner;
        rightSteerTarget = -outer;
      }
    }

    if (frontSteerRefs.current[0]) {
      frontSteerRefs.current[0].rotation.y = THREE.MathUtils.damp(
        frontSteerRefs.current[0].rotation.y,
        leftSteerTarget,
        6,
        delta,
      );
    }
    if (frontSteerRefs.current[1]) {
      frontSteerRefs.current[1].rotation.y = THREE.MathUtils.damp(
        frontSteerRefs.current[1].rotation.y,
        rightSteerTarget,
        6,
        delta,
      );
    }

    if (steeringRef.current) {
      steeringRef.current.rotation.x = THREE.MathUtils.damp(
        steeringRef.current.rotation.x,
        steerInput,
        8,
        delta,
      );
    }

    if (rootRef.current) {
      const y = state.engineOn ? Math.sin(t * 8) * 0.02 : 0;
      const acceleration = (velocityRef.current - lastVelocityRef.current) / Math.max(delta, 0.001);
      const pitchTarget = THREE.MathUtils.clamp(-acceleration * 0.015, -0.06, 0.05);
      rootRef.current.position.y = THREE.MathUtils.damp(
        rootRef.current.position.y,
        y,
        5,
        delta,
      );
      rootRef.current.rotation.z = THREE.MathUtils.damp(
        rootRef.current.rotation.z,
        pitchTarget,
        5,
        delta,
      );
    }
    lastVelocityRef.current = velocityRef.current;

    const enginePulse = state.engineOn
      ? 0.35 + 0.2 * Math.sin(t * (14 + state.speedKph * 0.08))
      : 0;
    if (exhaustLeftRef.current) {
      exhaustLeftRef.current.scale.setScalar(0.7 + enginePulse);
      (exhaustLeftRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        enginePulse;
    }
    if (exhaustRightRef.current) {
      exhaustRightRef.current.scale.setScalar(0.7 + enginePulse);
      (exhaustRightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        enginePulse;
    }

    if (sunroofRef.current) {
      sunroofRef.current.position.x = THREE.MathUtils.damp(
        sunroofRef.current.position.x,
        state.sunroofOpen ? 0.3 : -0.02,
        7,
        delta,
      );
    }

    const bodyColor = new THREE.Color(state.bodyColor);
    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      mat.color.lerp(bodyColor, THREE.MathUtils.clamp(delta * 4, 0, 1));
    }
    if (cabinRef.current) {
      const mat = cabinRef.current.material as THREE.MeshStandardMaterial;
      const cabinTarget = bodyColor.clone().offsetHSL(0, 0.02, 0.08);
      mat.color.lerp(cabinTarget, THREE.MathUtils.clamp(delta * 4, 0, 1));
    }

    const frontIntensity = state.lightsOn ? (state.engineOn ? 2.6 : 2.1) : 0.2;
    const rearIntensity = state.lightsOn ? 0.5 + hazardBlink * 1.7 : hazardBlink * 1.7;
    for (const lightRef of [leftHeadLightRef, rightHeadLightRef]) {
      if (!lightRef.current) {
        continue;
      }
      const mat = lightRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.damp(
        mat.emissiveIntensity,
        frontIntensity,
        9,
        delta,
      );
    }
    for (const lightRef of [leftTailLightRef, rightTailLightRef]) {
      if (!lightRef.current) {
        continue;
      }
      const mat = lightRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.damp(
        mat.emissiveIntensity,
        rearIntensity,
        9,
        delta,
      );
    }
  });

  return (
    <group ref={rootRef} position={[0, 0.6, 0]}>
      {!overlayOnly ? (
        <>
          <mesh ref={bodyRef} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.55, 1.55]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.35} roughness={0.3} />
          </mesh>
          <mesh ref={cabinRef} position={[0.15, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.5, 1.4]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.38} roughness={0.28} />
          </mesh>
          <mesh position={[-0.04, 0.72, 0]} receiveShadow>
            <boxGeometry args={[0.8, 0.05, 0.52]} />
            <meshStandardMaterial color="#1e293b" roughness={0.78} metalness={0.15} />
          </mesh>
        </>
      ) : null}
      <mesh ref={sunroofRef} position={[-0.02, 0.74, 0]} receiveShadow>
        <boxGeometry args={[0.72, 0.03, 0.42]} />
        {overlayOnly ? (
          <primitive object={hiddenHitboxMaterial} attach="material" />
        ) : (
          <meshStandardMaterial color="#020617" roughness={0.18} metalness={0.2} />
        )}
      </mesh>

      <group ref={leftDoorRef} position={[-1.0, 0.35, 0.82]}>
        <mesh
          castShadow
          receiveShadow
          position={[0.56, 0, -0.04]}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLeftDoor();
          }}
        >
          <boxGeometry args={[1.1, 0.42, 0.08]} />
          {overlayOnly ? (
            <primitive object={hiddenHitboxMaterial} attach="material" />
          ) : (
            <meshStandardMaterial color="#0369a1" metalness={0.42} roughness={0.35} />
          )}
        </mesh>
      </group>

      <group ref={rightDoorRef} position={[-1.0, 0.35, -0.82]}>
        <mesh
          castShadow
          receiveShadow
          position={[0.56, 0, 0.04]}
          onClick={(event) => {
            event.stopPropagation();
            onToggleRightDoor();
          }}
        >
          <boxGeometry args={[1.1, 0.42, 0.08]} />
          {overlayOnly ? (
            <primitive object={hiddenHitboxMaterial} attach="material" />
          ) : (
            <meshStandardMaterial color="#0369a1" metalness={0.42} roughness={0.35} />
          )}
        </mesh>
      </group>

      <group ref={trunkRef} position={[1.54, 0.36, 0]}>
        <mesh
          castShadow
          receiveShadow
          position={[0, 0.16, 0]}
          onClick={(event) => {
            event.stopPropagation();
            onToggleTrunk();
          }}
        >
          <boxGeometry args={[0.16, 0.34, 1.46]} />
          {overlayOnly ? (
            <primitive object={hiddenHitboxMaterial} attach="material" />
          ) : (
            <meshStandardMaterial color="#0284c7" metalness={0.35} roughness={0.38} />
          )}
        </mesh>
      </group>

      {!overlayOnly ? (
        <>
          <mesh ref={seatLeftRef} position={[-0.2, 0.28, 0.35]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.35, 0.28]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.75} metalness={0.08} />
          </mesh>
          <mesh ref={seatRightRef} position={[-0.2, 0.28, -0.35]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.35, 0.28]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.75} metalness={0.08} />
          </mesh>
          <mesh ref={steeringRef} position={[-0.92, 0.5, 0.34]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.12, 0.026, 16, 36]} />
            <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.55} />
          </mesh>
          {[
            { x: -1.1, y: -0.06, z: 0.75, steer: true },
            { x: 1.08, y: -0.06, z: 0.75, steer: false },
            { x: -1.1, y: -0.06, z: -0.75, steer: true },
            { x: 1.08, y: -0.06, z: -0.75, steer: false },
          ].map((position, index) => {
            const frontSteerIndex = index === 0 ? 0 : index === 2 ? 1 : -1;
            return (
              <group
                key={`wheel-${index}`}
                ref={(node) => {
                  if (!node || frontSteerIndex < 0) {
                    return;
                  }
                  frontSteerRefs.current[frontSteerIndex] = node;
                }}
                position={[position.x, position.y, position.z]}
              >
                <mesh
                  ref={(node) => {
                    if (!node) {
                      return;
                    }
                    wheelSpinRefs.current[index] = node;
                  }}
                  castShadow
                  receiveShadow
                  material={wheelMaterial}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.27, 0.27, 0.22, 24]} />
                </mesh>
              </group>
            );
          })}
        </>
      ) : null}

      <mesh ref={leftHeadLightRef} position={[-1.56, 0.22, 0.45]} visible={!overlayOnly}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial
          emissive={state.lightsOn ? "#fde68a" : "#0f172a"}
          emissiveIntensity={state.lightsOn ? 2.1 : 0.2}
          color={state.lightsOn ? "#fef3c7" : "#334155"}
        />
      </mesh>
      <mesh ref={rightHeadLightRef} position={[-1.56, 0.22, -0.45]} visible={!overlayOnly}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial
          emissive={state.lightsOn ? "#fde68a" : "#0f172a"}
          emissiveIntensity={state.lightsOn ? 2.1 : 0.2}
          color={state.lightsOn ? "#fef3c7" : "#334155"}
        />
      </mesh>
      <mesh ref={leftTailLightRef} position={[1.57, 0.2, 0.44]} visible={!overlayOnly}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={rightTailLightRef} position={[1.57, 0.2, -0.44]} visible={!overlayOnly}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
      </mesh>

      {state.lightsOn && !overlayOnly ? (
        <>
          <pointLight
            position={[-2.2, 0.24, 0.45]}
            intensity={state.engineOn ? 4.8 : 3.8}
            distance={5.5}
            color="#fef3c7"
          />
          <pointLight
            position={[-2.2, 0.24, -0.45]}
            intensity={state.engineOn ? 4.8 : 3.8}
            distance={5.5}
            color="#fef3c7"
          />
        </>
      ) : null}

      <mesh ref={exhaustLeftRef} position={[1.7, 0.02, 0.42]} visible={!overlayOnly || state.engineOn}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#94a3b8" emissive="#cbd5e1" emissiveIntensity={0} />
      </mesh>
      <mesh
        ref={exhaustRightRef}
        position={[1.7, 0.02, -0.42]}
        visible={!overlayOnly || state.engineOn}
      >
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#94a3b8" emissive="#cbd5e1" emissiveIntensity={0} />
      </mesh>
    </group>
  );
}

export function CarShowroomScene({
  state,
  cameraPreset,
  autoTour,
  useAssetModel,
  modelUrl = "/models/car-showroom.glb",
  onToggleLeftDoor,
  onToggleRightDoor,
  onToggleTrunk,
}: CarShowroomSceneProps) {
  const [assetScene, setAssetScene] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!useAssetModel) {
      return;
    }

    let active = true;
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (!active) {
          return;
        }
        const loadedScene = gltf.scene.clone(true);
        const meshWorldBounds: THREE.Box3[] = [];
        const meshDiagonals: number[] = [];
        loadedScene.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const ownName = mesh.name.toLowerCase();
            const parentName = mesh.parent?.name?.toLowerCase() ?? "";
            const helperNamePattern = /(camera|cam|target|helper|gizmo|locator|control)/;
            if (helperNamePattern.test(ownName) || helperNamePattern.test(parentName)) {
              mesh.visible = false;
              return;
            }
          }
        });
        loadedScene.updateWorldMatrix(true, true);

        loadedScene.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.visible) {
            return;
          }
          const material = mesh.material;
          const primaryMaterial = Array.isArray(material) ? material[0] : material;
          if (
            primaryMaterial instanceof THREE.MeshStandardMaterial &&
            primaryMaterial.transparent &&
            primaryMaterial.opacity < 0.02
          ) {
            return;
          }
          mesh.geometry.computeBoundingBox();
          const localBox = mesh.geometry.boundingBox;
          if (!localBox) {
            return;
          }
          const worldBox = localBox.clone().applyMatrix4(mesh.matrixWorld);
          const size = new THREE.Vector3();
          worldBox.getSize(size);
          const diagonal = size.length();
          if (!Number.isFinite(diagonal) || diagonal < 1e-4) {
            return;
          }
          meshWorldBounds.push(worldBox);
          meshDiagonals.push(diagonal);
        });

        // Normalize asset transform so different market models load at a consistent
        // scale and stay centered in the showroom camera focus.
        let normalizedBounds: THREE.Box3;
        if (meshWorldBounds.length > 0) {
          const sorted = [...meshDiagonals].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)] ?? 1;
          const p90 = sorted[Math.floor(sorted.length * 0.9)] ?? median;
          const filtered = meshWorldBounds.filter((box, index) => {
            const d = meshDiagonals[index] ?? median;
            return d >= median * 0.18 && d <= p90 * 1.8;
          });
          const activeBounds = filtered.length > 0 ? filtered : meshWorldBounds;
          normalizedBounds = activeBounds.reduce(
            (acc, box) => acc.union(box),
            activeBounds[0]!.clone(),
          );
        } else {
          normalizedBounds = new THREE.Box3().setFromObject(loadedScene);
        }
        const normalizedSize = new THREE.Vector3();
        const normalizedCenter = new THREE.Vector3();
        normalizedBounds.getSize(normalizedSize);
        normalizedBounds.getCenter(normalizedCenter);
        loadedScene.position.sub(normalizedCenter);

        const maxDim = Math.max(normalizedSize.x, normalizedSize.y, normalizedSize.z, 1);
        const targetSize = 3.8;
        const scaleFactor = targetSize / maxDim;
        loadedScene.scale.setScalar(scaleFactor);

        const groundedBounds = new THREE.Box3().setFromObject(loadedScene);
        loadedScene.position.y -= groundedBounds.min.y;
        // Align asset forward axis with camera presets:
        // camera "front" assumes vehicle nose points to -X in this scene.
        loadedScene.rotation.y = Math.PI;

        setAssetScene(loadedScene);
      },
      undefined,
      () => {
        if (active) {
          setAssetScene(null);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [modelUrl, useAssetModel]);

  return (
    <div className="h-[520px] overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80">
      <Canvas shadows>
        <CameraRig preset={cameraPreset} autoTour={autoTour} />
        <color attach="background" args={["#020617"]} />
        <Environment preset="night" />
        <ambientLight intensity={0.42} />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <pointLight position={[-4, 2, -3]} intensity={0.25} color="#67e8f9" />

        {useAssetModel && assetScene ? (
          <>
            <AssetModel object={assetScene} state={state} />
            <CarModel
              state={state}
              overlayOnly
              onToggleLeftDoor={onToggleLeftDoor}
              onToggleRightDoor={onToggleRightDoor}
              onToggleTrunk={onToggleTrunk}
            />
          </>
        ) : (
          <CarModel
            state={state}
            onToggleLeftDoor={onToggleLeftDoor}
            onToggleRightDoor={onToggleRightDoor}
            onToggleTrunk={onToggleTrunk}
          />
        )}

        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.22, 0]}
        >
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial color="#0f172a" roughness={0.96} metalness={0.1} />
        </mesh>
        <ContactShadows
          position={[0, -0.2, 0]}
          opacity={0.48}
          blur={2.4}
          scale={10}
          far={4}
        />

        <OrbitControls
          enablePan={false}
          enableRotate={!autoTour && cameraPreset !== "cockpit"}
          minDistance={3.8}
          maxDistance={9}
          minPolarAngle={0.6}
          maxPolarAngle={1.5}
        />
      </Canvas>
    </div>
  );
}
