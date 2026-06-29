"use client";

import { useRef, useEffect, MutableRefObject, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function MetalRing({ mouse }: { mouse: MutableRefObject<[number, number]> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotY = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    rotY.current += 0.003;
    meshRef.current.rotation.y = rotY.current;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mouse.current[1] * 0.35,
      0.04
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      -mouse.current[0] * 0.22,
      0.04
    );
  });

  return (
    <mesh ref={meshRef} rotation={[0.35, 0, 0.1]}>
      <torusGeometry args={[1.5, 0.38, 64, 128]} />
      <meshPhysicalMaterial
        color="#c8a86a"
        metalness={1}
        roughness={0.08}
        envMapIntensity={1.8}
      />
    </mesh>
  );
}

export default function HeroCanvas() {
  const mouseRef = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      ];
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 4, 4]} intensity={1.0} color="#fff8f0" />
      <pointLight position={[-4, 2, 3]} intensity={0.8} color="#e8c06a" />
      <pointLight position={[2, -3, 2]} intensity={0.3} color="#ffffff" />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <MetalRing mouse={mouseRef} />
      </Suspense>
    </Canvas>
  );
}
