// components/LogoItem.tsx
// This component represents a collectible logo in the game. It creates a clone of a given logo model and 
// makes it interactable for the player. Once the player collects the logo by getting close, the logo disappears.

import React, { useRef, useMemo } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerRef } from "./Player";

interface LogoItemProps {
  playerRef: React.RefObject<PlayerRef>;
  position: [number, number, number];
  model: THREE.Group;
  logoIndex: number;
  onCollect: () => void;
}

export function LogoItem({
  playerRef,
  position,
  model,
  logoIndex,
  onCollect,
}: LogoItemProps) {
  const isCollected = useRef(false);

  // Clone the logo model and set up its position, size, and scaling
  const clonedLogo = useMemo(() => {
    const clone = model.clone(true);

    const validChildren: THREE.Object3D[] = [];
    clone.children.forEach((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        validChildren.push(child);
      }
    });

    const selectedChild = validChildren[logoIndex];
    if (!selectedChild) {
      return new THREE.Group(); // Return an empty group if the logo is not found
    }

    const wrapper = new THREE.Group();
    const logoMesh = selectedChild.clone();
    wrapper.add(logoMesh);

    const box = new THREE.Box3().setFromObject(wrapper);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    wrapper.position.sub(center);

    // Scale to fit the collider box (0.8)
    const scaleFactor = 0.8 / Math.max(size.x, size.y, size.z);
    wrapper.scale.setScalar(scaleFactor);

    // After scaling, recalculate height and center it inside the box
    const adjustedHeight = size.y * scaleFactor;
    wrapper.position.y += (0.4 - adjustedHeight) / 2; // Center in 0.8 box

    return wrapper;
  }, [model, logoIndex]);

  const size: [number, number, number] = [0.8, 0.8, 0.8];

  const [ref, api] = useBox<THREE.Group>(() => ({
    mass: 1,
    type: "Static",
    position: [position[0], position[1] + size[1] / 2, position[2]],
    args: size,
    userData: { isCollectible: true },
  }));

  useFrame(() => {
    if (!ref.current || !playerRef.current || isCollected.current) return;

    const logoPos = new THREE.Vector3();
    ref.current.getWorldPosition(logoPos);

    const playerPos = playerRef.current.getPosition();

    if (logoPos.distanceTo(playerPos) < 1.5) {
      isCollected.current = true;
      onCollect();

      api.position.set(0, -100, 0); // Move the logo out of the view
      api.mass.set(0); // Remove mass so it doesn't react to physics anymore
      ref.current.visible = false; // Hide the logo
    }
  });

  return !isCollected.current ? (
    <group ref={ref} castShadow receiveShadow>
      <primitive object={clonedLogo} />
    </group>
  ) : null;
}