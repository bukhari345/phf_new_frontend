"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Extend type for GLTF
type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
};

// 🔹 Example 1: Spinning Box (no model)
function SpinningBox() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
    }
  });
  return (
    <mesh ref={ref} position={[-2, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

// 🔹 Example 2: Bouncing Sphere (no model)
function BouncingSphere() {
  const ref = useRef<THREE.Mesh>(null!);
  let direction = 1;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += 0.05 * direction;
      if (ref.current.position.y > 2 || ref.current.position.y < -2) {
        direction *= -1; // reverse
      }
    }
  });

  return (
    <mesh ref={ref} position={[2, 0, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="skyblue" />
    </mesh>
  );
}

// 🔹 Example 3: GLB Model with Animations
function AnimatedModel() {
  // ⚡ Use Fox.glb sample from KhronosGroup if you don’t have your own
  const { scene, animations } = useGLTF(
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb"
  ) as GLTFResult;

  const { actions, names } = useAnimations(animations, scene);
  const [current, setCurrent] = useState<string>("Walk");

  useEffect(() => {
    const action = actions[current];
    if (action) {
      action.reset().fadeIn(0.5).play();
    }
    return () => {
      if (action) action.fadeOut(0.5);
    };
  }, [current, actions]);

  return (
    <>
      <primitive object={scene} scale={0.03} position={[0, -1, 0]} />
      {/* Animation buttons */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        {names.map((name) => (
          <button
            key={name}
            style={{ marginRight: "10px" }}
            onClick={() => setCurrent(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </>
  );
}

// 🔹 Main Scene
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} />
        <SpinningBox />
        <BouncingSphere />
        <AnimatedModel />
      </Canvas>
    </div>
  );
}
