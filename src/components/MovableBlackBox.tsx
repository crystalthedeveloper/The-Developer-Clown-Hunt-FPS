// components/MovableBlackBox.tsx
// This component creates a movable black box that reacts to player interaction. When the box is hit, it will move in the 3D world. 
// The box has damping applied to its movement and angular damping to prevent excessive spinning.

import { Mesh } from "three";
import { useBox } from "@react-three/cannon";

type MovableBlackBoxProps = {
  position: [number, number, number];
  size?: [number, number, number];
};

export function MovableBlackBox({ position, size = [1, 1, 1] }: MovableBlackBoxProps) {
  const [ref] = useBox<Mesh>(() => ({
    mass: 1, // Make it dynamic so it can move
    position: [position[0], position[1] + size[1] / 2, position[2]], // Adjust the Y position to center it correctly
    args: size, // Define the size of the box
    userData: { isObstacle: true },
    linearDamping: 0.5, // Slightly dampen the movement to make it more natural
    angularDamping: 0.5, // Prevent excessive rotation when hit
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}