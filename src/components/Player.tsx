// components/Player.tsx
// This component defines the player character in a 3D game. The player is represented as a sphere and controlled by physics through react-three/fiber and react-three/cannon.
// It handles player movement, shooting, collision detection with clowns, fall detection, and bullet management.

import { forwardRef, useImperativeHandle } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import * as THREE from "three";
import { useGameStore } from "../store/store";

export interface PlayerRef {
  shoot: () => void;
  getPosition: () => THREE.Vector3;
}

interface PlayerProps {
  onDie: () => void;
  bulletsRef: React.MutableRefObject<THREE.Mesh[]>;
}

export const Player = forwardRef<PlayerRef, PlayerProps>(
  ({ onDie, bulletsRef }, ref) => {
    const { velocity, rotation, clownData } = useGameStore();
    const { camera, scene } = useThree();

    const [playerBodyRef, api] = useSphere<THREE.Mesh>(() => ({
      mass: 1,
      position: [0, 1, 0],
      args: [0.5],
      type: "Dynamic",
      linearDamping: 0.05,
      angularDamping: 0.2,
      userData: { isPlayer: true },
    }));

    useImperativeHandle(ref, () => ({
      shoot,
      getPosition: () => {
        const playerPosition = new THREE.Vector3();
        playerBodyRef.current?.getWorldPosition(playerPosition);
        return playerPosition;
      },
    }));

    useFrame(() => {
      if (!playerBodyRef.current) return;

      const playerRotation = new THREE.Euler(0, rotation, 0);
      const direction = new THREE.Vector3(0, 0, 1)
        .applyEuler(playerRotation)
        .multiplyScalar(velocity.z);

      api.velocity.set(direction.x * 3, 0, direction.z * 3);

      const playerPosition = new THREE.Vector3();
      playerBodyRef.current.getWorldPosition(playerPosition);

      camera.position.set(playerPosition.x, playerPosition.y + 0.5, playerPosition.z);
      camera.rotation.set(0, rotation, 0);

      const cameraTarget = new THREE.Vector3(0, 0, -1)
        .applyEuler(camera.rotation)
        .add(camera.position);
      camera.lookAt(cameraTarget);

      // Stop spinning when not moving
      if (velocity.z === 0 && velocity.x === 0) {
        api.angularVelocity.set(0, 0, 0); // Stop spinning when the player is not moving
      }

      // Fall detection
      if (playerPosition.y < -2) {
        onDie();
      }

      // Simple collision with clowns
      clownData.forEach((clown) => {
        if (!clown.isAlive) return;
        const clownPosition = new THREE.Vector3(...clown.position);
        if (playerPosition.distanceTo(clownPosition) < 1.2) {
          onDie();
        }
      });

      // Clean up bullets that went far away (safety fallback)
      bulletsRef.current.forEach((bullet, index) => {
        if (bullet.position.length() > 200) {
          scene.remove(bullet);
          bulletsRef.current.splice(index, 1);
        }
      });
    });

    const shoot = () => {
      const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: "yellow" })
      );

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const bulletStartPosition = camera.position.clone().add(cameraDirection.clone().multiplyScalar(0.8));
      bullet.position.copy(bulletStartPosition);

      scene.add(bullet);
      bulletsRef.current.push(bullet);

      const bulletVelocity = cameraDirection.clone().multiplyScalar(1.5);

      const bulletInterval = setInterval(() => {
        bullet.position.add(bulletVelocity);

        // If bullet is too far, remove it
        if (bullet.position.length() > 100) {
          scene.remove(bullet);
          bulletsRef.current = bulletsRef.current.filter((b) => b !== bullet);
          clearInterval(bulletInterval);
        }

        // Defensive check: if the bullet is removed by collision, stop interval
        if (!bullet.parent) {
          clearInterval(bulletInterval);
        }
      }, 20);
    };

    return (
      <mesh ref={playerBodyRef} castShadow visible={false}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }
);