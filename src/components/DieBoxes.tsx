// components/DieBoxes.tsx
// This component defines DieBox objects that, when touched by the player, trigger the "onPlayerDie" callback to end the game.

import { Mesh } from "three";
import { useBox } from "@react-three/cannon";

type DieBoxProps = {
  position: [number, number, number];
  size?: [number, number, number];
  onPlayerDie: () => void;
};

export function DieBox({
  position,
  size = [2, 4, 2],
  onPlayerDie,
}: DieBoxProps) {
  const [ref] = useBox<Mesh>(() => ({
    mass: 1,
    type: "Static",
    position: [position[0], position[1] + size[1] / 2, position[2]],
    args: size,
    userData: { isDieBox: true },
    onCollide: (e) => {
      if (e.body.userData.isPlayer) {
        // Trigger game over when player touches the DieBox
        onPlayerDie();
      }
    },
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

type DieBoxesProps = {
  existingPositions: [number, number, number][];
  onPlayerDie: () => void;
};

export function DieBoxes({ existingPositions, onPlayerDie }: DieBoxesProps) {
  return (
    <>
      {existingPositions.map((pos, index) => (
        <DieBox
          key={index}
          position={pos}
          onPlayerDie={onPlayerDie}
        />
      ))}
    </>
  );
}