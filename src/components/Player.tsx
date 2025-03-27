// components/Player.tsx
// This component defines the player character in a 3D game. The player is represented as a sphere and controlled by physics through react-three/fiber and react-three/cannon.
// It handles player movement, shooting, collision detection with clowns, fall detection, and bullet management.

// components/Player.tsx
import { forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import * as THREE from "three";
import { useGameStore } from "../store/store";

const shootSound = new Audio("/single-shot.mp3");
shootSound.volume = 0.6;

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

    const aimDotRef = useRef<THREE.Object3D | null>(null);

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

    useEffect(() => {
      const color = new THREE.Color(1, 1, 0).multiplyScalar(0.5); // brighter neon yellow
      const lineMaterial = new THREE.LineBasicMaterial({
        color,
        depthTest: false,
        transparent: true,
        opacity: 1,
      });

      const xShapeGeometry1 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.05, 0.05, 0),
        new THREE.Vector3(0.05, -0.05, 0),
      ]);

      const xShapeGeometry2 = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.05, 0.05, 0),
        new THREE.Vector3(-0.05, -0.05, 0),
      ]);

      const line1 = new THREE.Line(xShapeGeometry1, lineMaterial);
      const line2 = new THREE.Line(xShapeGeometry2, lineMaterial);

      const cross = new THREE.Group();
      cross.add(line1);
      cross.add(line2);

      cross.renderOrder = 999; // ✅ force it on top
      cross.position.y += 0.001; // ✅ slight offset to prevent z-fighting

      aimDotRef.current = cross;
      scene.add(cross);

      return () => {
        scene.remove(cross);
        xShapeGeometry1.dispose();
        xShapeGeometry2.dispose();
        lineMaterial.dispose();
      };
    }, [scene]);


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

      if (aimDotRef.current) {
        const aimDir = new THREE.Vector3();
        camera.getWorldDirection(aimDir);
        const dotPosition = camera.position.clone().add(aimDir.multiplyScalar(2));
        aimDotRef.current.position.copy(dotPosition);
        aimDotRef.current.lookAt(camera.position);
      }

      if (velocity.z === 0 && velocity.x === 0) {
        api.angularVelocity.set(0, 0, 0);
      }

      if (playerPosition.y < -2) {
        onDie();
      }

      clownData.forEach((clown) => {
        if (!clown.isAlive) return;
        const clownPosition = new THREE.Vector3(...clown.position);
        if (playerPosition.distanceTo(clownPosition) < 1.2) {
          onDie();
        }
      });

      // ✅ Bullet update with realistic distance cap
      bulletsRef.current.forEach((bullet, index) => {
        bullet.position.add(bullet.userData.velocity);

        // Track traveled distance
        bullet.userData.travelled = (bullet.userData.travelled || 0) + bullet.userData.velocity.length();

        // Remove if bullet goes too far
        if (bullet.userData.travelled > 10) {
          scene.remove(bullet);
          bullet.geometry.dispose();
          (bullet.material as THREE.Material).dispose();
          bulletsRef.current.splice(index, 1);
        }
      });
    });

    const shoot = () => {
      shootSound.currentTime = 0;
      shootSound.play();

      const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshStandardMaterial({ color: "black" })
      );

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const bulletStartPosition = camera.position.clone().add(cameraDirection.clone().multiplyScalar(0.2));
      bullet.position.copy(bulletStartPosition);
      bullet.userData.velocity = cameraDirection.clone().multiplyScalar(1); // Slower, more realistic
      bullet.userData.travelled = 0;

      scene.add(bullet);
      bulletsRef.current.push(bullet);
    };

    return (
      <mesh ref={playerBodyRef} castShadow visible={false}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }
);