// components/Ground.tsx
// This component represents the ground in the game. It creates a static ground plane using physics, 
// making it interactable with other objects, such as the player and obstacles.

import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { GROUND_SIZE } from "../App";

interface GroundProps {
  size?: [number, number];
}

export function Ground({ size = [GROUND_SIZE, GROUND_SIZE] }: GroundProps) {
  const [ref] = useBox<THREE.Mesh>(() => ({
    args: [size[0], 1, size[1]], // Define the size of the ground
    position: [0, -0.05, 0], // Position the ground slightly below the player
    type: "Static", // Make the ground a static object that doesn't move
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[size[0], 1, size[1]]} />
      <meshStandardMaterial
        color="#1f2022" // Dark color for the ground
        roughness={0.1} // Slightly rough surface
        metalness={1} // Full metallic surface for the ground
        envMapIntensity={1} // Reflective surface settings
      />
    </mesh>
  );
}