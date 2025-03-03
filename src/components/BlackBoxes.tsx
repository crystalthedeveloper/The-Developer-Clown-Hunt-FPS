// components/BlackBoxs.tsx
// This component represents static black boxes placed in the game world. These boxes act as obstacles 
// for the player to avoid or interact with. The `BlackBox` is placed at the specified position with 
// a given size, and the `BlackBoxes` component manages multiple such boxes.

import { Mesh } from "three";
import { useBox } from "@react-three/cannon";

type BlackBoxProps = {
  position: [number, number, number];
  size?: [number, number, number];
};

export function BlackBox({ position, size = [2, 4, 2] }: BlackBoxProps) {
  const [ref] = useBox<Mesh>(() => ({
    mass: 1,
    type: "Static",
    position: [position[0], position[1] + size[1] / 2, position[2]], // Y-adjustment here
    args: size,
    userData: { isObstacle: true },
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

type BlackBoxesProps = {
  existingPositions: [number, number, number][];
};

export function BlackBoxes({ existingPositions }: BlackBoxesProps) {
  return (
    <>
      {existingPositions.map((pos, index) => (
        <BlackBox key={index} position={pos} />
      ))}
    </>
  );
}