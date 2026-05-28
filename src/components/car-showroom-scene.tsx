"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type CarShowroomState = {
  leftDoorOpen: boolean;
  rightDoorOpen: boolean;
  trunkOpen: boolean;
  lightsOn: boolean;
  engineOn: boolean;
  seatOffset: number;
};

type CarShowroomSceneProps = {
  state: CarShowroomState;
  onToggleLeftDoor: () => void;
  onToggleRightDoor: () => void;
  onToggleTrunk: () => void;
};

function CarModel({
  state,
  onToggleLeftDoor,
  onToggleRightDoor,
  onToggleTrunk,
}: CarShowroomSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const trunkRef = useRef<THREE.Group>(null);
  const seatLeftRef = useRef<THREE.Mesh>(null);
  const seatRightRef = useRef<THREE.Mesh>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);

  const wheelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0f172a",
        metalness: 0.25,
        roughness: 0.65,
      }),
    [],
  );

  useFrame((renderState, delta) => {
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

    const seatTarget = THREE.MathUtils.clamp(state.seatOffset, -0.45, 0.45);
    if (seatLeftRef.current) {
      seatLeftRef.current.position.z = THREE.MathUtils.damp(
        seatLeftRef.current.position.z,
        0.2 + seatTarget,
        9,
        delta,
      );
    }
    if (seatRightRef.current) {
      seatRightRef.current.position.z = THREE.MathUtils.damp(
        seatRightRef.current.position.z,
        0.2 + seatTarget,
        9,
        delta,
      );
    }

    const runFactor = state.engineOn ? 1 : 0;
    for (const wheel of wheelRefs.current) {
      wheel.rotation.x += delta * runFactor * 6.5;
    }

    if (rootRef.current) {
      const t = renderState.clock.getElapsedTime();
      const y = state.engineOn ? Math.sin(t * 8) * 0.02 : 0;
      rootRef.current.position.y = THREE.MathUtils.damp(
        rootRef.current.position.y,
        y,
        5,
        delta,
      );
    }
  });

  return (
    <group ref={rootRef} position={[0, 0.6, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.55, 1.55]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0.15, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.5, 1.4]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.38} roughness={0.28} />
      </mesh>

      <group ref={leftDoorRef} position={[-1.0, 0.35, 0.82]}>
        <mesh
          castShadow
          receiveShadow
          position={[0.55, 0, -0.22]}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLeftDoor();
          }}
        >
          <boxGeometry args={[1.1, 0.42, 0.08]} />
          <meshStandardMaterial color="#0369a1" metalness={0.42} roughness={0.35} />
        </mesh>
      </group>

      <group ref={rightDoorRef} position={[-1.0, 0.35, -0.82]}>
        <mesh
          castShadow
          receiveShadow
          position={[0.55, 0, 0.22]}
          onClick={(event) => {
            event.stopPropagation();
            onToggleRightDoor();
          }}
        >
          <boxGeometry args={[1.1, 0.42, 0.08]} />
          <meshStandardMaterial color="#0369a1" metalness={0.42} roughness={0.35} />
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
          <meshStandardMaterial color="#0284c7" metalness={0.35} roughness={0.38} />
        </mesh>
      </group>

      <mesh ref={seatLeftRef} position={[-0.2, 0.28, 0.35]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.35, 0.28]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.75} metalness={0.08} />
      </mesh>
      <mesh ref={seatRightRef} position={[-0.2, 0.28, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.35, 0.28]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.75} metalness={0.08} />
      </mesh>

      {[[-1.1, -0.06, 0.75], [1.08, -0.06, 0.75], [-1.1, -0.06, -0.75], [1.08, -0.06, -0.75]]
        .map((position, index) => (
          <mesh
            key={`wheel-${index}`}
            ref={(node) => {
              if (!node) {
                return;
              }
              wheelRefs.current[index] = node;
            }}
            position={new THREE.Vector3(position[0], position[1], position[2])}
            castShadow
            receiveShadow
            material={wheelMaterial}
          >
            <cylinderGeometry args={[0.27, 0.27, 0.22, 24]} />
          </mesh>
        ))}

      <mesh position={[-1.56, 0.22, 0.45]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial
          emissive={state.lightsOn ? "#fde68a" : "#0f172a"}
          emissiveIntensity={state.lightsOn ? 2.1 : 0.2}
          color={state.lightsOn ? "#fef3c7" : "#334155"}
        />
      </mesh>
      <mesh position={[-1.56, 0.22, -0.45]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial
          emissive={state.lightsOn ? "#fde68a" : "#0f172a"}
          emissiveIntensity={state.lightsOn ? 2.1 : 0.2}
          color={state.lightsOn ? "#fef3c7" : "#334155"}
        />
      </mesh>

      {state.lightsOn ? (
        <>
          <pointLight position={[-2.2, 0.24, 0.45]} intensity={3.8} distance={5.5} color="#fef3c7" />
          <pointLight
            position={[-2.2, 0.24, -0.45]}
            intensity={3.8}
            distance={5.5}
            color="#fef3c7"
          />
        </>
      ) : null}
    </group>
  );
}

export function CarShowroomScene({
  state,
  onToggleLeftDoor,
  onToggleRightDoor,
  onToggleTrunk,
}: CarShowroomSceneProps) {
  return (
    <div className="h-[520px] overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80">
      <Canvas camera={{ position: [5.2, 2.4, 4.6], fov: 45 }} shadows>
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.42} />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <pointLight position={[-4, 2, -3]} intensity={0.25} color="#67e8f9" />

        <CarModel
          state={state}
          onToggleLeftDoor={onToggleLeftDoor}
          onToggleRightDoor={onToggleRightDoor}
          onToggleTrunk={onToggleTrunk}
        />

        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.22, 0]}
        >
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial color="#0f172a" roughness={0.96} metalness={0.1} />
        </mesh>

        <OrbitControls
          enablePan={false}
          minDistance={3.8}
          maxDistance={9}
          minPolarAngle={0.6}
          maxPolarAngle={1.5}
        />
      </Canvas>
    </div>
  );
}
