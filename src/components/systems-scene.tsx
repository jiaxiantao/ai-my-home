"use client";

import { Float, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";

type SceneNode = {
  id: string;
  label: string;
  color: string;
};

const defaultNodes: SceneNode[] = [
  { id: "arch", label: "架构", color: "#22d3ee" },
  { id: "perf", label: "性能", color: "#34d399" },
  { id: "eng", label: "工程", color: "#a78bfa" },
  { id: "ai", label: "AI", color: "#fbbf24" },
  { id: "full", label: "全栈", color: "#fb7185" },
  { id: "collab", label: "协作", color: "#60a5fa" },
];

function OrbitNode({
  node,
  index,
  total,
}: {
  node: SceneNode;
  index: number;
  total: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 2.35;

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    const t = state.clock.elapsedTime * 0.35 + angle;
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.z = Math.sin(t) * radius;
    meshRef.current.position.y = Math.sin(t * 1.4) * 0.35;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.35}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.65}
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>
    </Float>
  );
}

function CoreHub() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.75, 1]} />
      <meshStandardMaterial
        color="#0f172a"
        emissive="#22d3ee"
        emissiveIntensity={0.35}
        wireframe
      />
    </mesh>
  );
}

function SceneContent({ nodes }: { nodes: SceneNode[] }) {
  const orbitNodes = useMemo(() => nodes.slice(0, 8), [nodes]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 4]} intensity={1.4} color="#22d3ee" />
      <pointLight position={[-4, -2, -3]} intensity={0.8} color="#a78bfa" />
      <CoreHub />
      {orbitNodes.map((node, index) => (
        <OrbitNode key={node.id} node={node} index={index} total={orbitNodes.length} />
      ))}
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={9}
        autoRotate
        autoRotateSpeed={0.45}
      />
    </>
  );
}

export function SystemsScene({
  nodes = defaultNodes,
}: {
  nodes?: SceneNode[];
}) {
  return (
    <div className="relative h-[min(420px,50vh)] w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.12),transparent_55%)]" />
      <Canvas
        camera={{ position: [0, 1.2, 6.2], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#020617"]} />
        <fog attach="fog" args={["#020617", 6, 14]} />
        <SceneContent nodes={nodes} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        Three.js · @react-three/fiber
      </p>
    </div>
  );
}
