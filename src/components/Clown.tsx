// components/Clown.tsx
// This component represents a Clown character that chases the player. It uses physics and animations 
// to handle the movement and interactions (such as being hit by bullets or catching the player).

import { useFrame } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { useEffect, useRef, useMemo, useState } from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { PlayerRef } from "./Player";

interface ClownProps {
  id: number;
  position: [number, number, number];
  model: THREE.Group;
  animations: THREE.AnimationClip[];
  playerRef: React.RefObject<PlayerRef>;
  bulletsRef: React.MutableRefObject<THREE.Mesh[]>;
  onKill: (id: number) => void;
  onCatch: () => void;
}

export function Clown({
  id,
  position,
  model,
  animations,
  playerRef,
  bulletsRef,
  onKill,
  onCatch,
}: ClownProps) {
  const clownRef = useRef<THREE.Group>(null);
  const isDyingRef = useRef(false);
  const prevDirectionRef = useRef(new THREE.Vector3());

  const [isAlive, setIsAlive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [canCatch, setCanCatch] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const [isGameOverTriggered, setIsGameOverTriggered] = useState(false);

  // Clone model and process skeleton/offsets
  const { clonedScene, height } = useMemo(() => {
    const clone = model.clone(true);
    const bonesMap: Record<string, THREE.Bone> = {};
    const skinnedMeshes: THREE.SkinnedMesh[] = [];

    clone.traverse((child) => {
      if ((child as THREE.Bone).isBone) bonesMap[child.name] = child as THREE.Bone;
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) skinnedMeshes.push(child as THREE.SkinnedMesh);
    });

    skinnedMeshes.forEach((mesh) => {
      mesh.frustumCulled = false;
      if (mesh.skeleton) {
        const updatedBones = mesh.skeleton.bones.map((bone) => bonesMap[bone.name] || bone);
        mesh.skeleton = new THREE.Skeleton(updatedBones);
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    clone.position.sub(center); // Recenter the model
    return { clonedScene: clone, height: size.y };
  }, [model]);

  const { actions } = useAnimations(animations, clonedScene);

  // Physics Collider
  const [apiRef, api] = useBox(() => ({
    mass: 1,
    position: [
      position[0], 
      position[1] + height / 2 + 1.0, // Adjusted position for better alignment above the ground
      position[2],
    ], 
    args: [1, height, 1],
    fixedRotation: true,
    linearDamping: 0.4,
    angularDamping: 0.4,
  }));

  const playAnimation = (name: string) => {
    Object.values(actions).forEach((action) => action?.fadeOut(0.2));
    actions[name]?.reset().fadeIn(0.2).play();
  };

  useEffect(() => {
    const catchTimer = setTimeout(() => setCanCatch(true), 1000);
    const aiTimer = setTimeout(() => setIsAIActive(true), 500);

    playAnimation("idle");

    return () => {
      clearTimeout(catchTimer);
      clearTimeout(aiTimer);
    };
  }, []);

  // Sync clown model position with physics collider
  useEffect(() => {
    const unsubscribe = api.position.subscribe(([x, y, z]) => {
      clownRef.current?.position.set(x, y, z);
    });

    return unsubscribe;
  }, [api]);

  useFrame(() => {
    if (!isAlive || isDyingRef.current || !clownRef.current || !playerRef.current || isGameOverTriggered || !isAIActive) return;

    const clownObject = clownRef.current;
    const clownPos = clownObject.position;
    const playerPos = playerRef.current.getPosition();
    const distance = clownPos.distanceTo(playerPos);

    const chaseDistance = 8;
    const stopChaseDistance = 25;
    const catchDistance = 1.5;
    const runSpeed = 80;

    // Stop chasing if too far
    if (distance > stopChaseDistance) {
      if (isRunning) {
        setIsRunning(false);
        playAnimation("idle");
      }
      api.velocity.set(0, 0, 0);
      return;
    }

    // Chase player
    if (distance <= chaseDistance) {
      const direction = new THREE.Vector3().subVectors(playerPos, clownPos).normalize();

      if (!direction.equals(prevDirectionRef.current)) {
        clownObject.lookAt(playerPos);
        prevDirectionRef.current.copy(direction);
      }

      api.velocity.set(direction.x * runSpeed, 0, direction.z * runSpeed);

      if (!isRunning) {
        setIsRunning(true);
        playAnimation("run");
      }
    } else {
      if (isRunning) {
        setIsRunning(false);
        playAnimation("idle");
      }
      api.velocity.set(0, 0, 0);
    }

    // Catch player
    if (distance < catchDistance && canCatch && !isGameOverTriggered) {
      setIsGameOverTriggered(true);
      api.velocity.set(0, 0, 0);
      playAnimation("idle");
      onCatch();
    }

    // Check for bullet collision
    const clownBox = new THREE.Box3().setFromObject(clownObject);
    bulletsRef.current.forEach((bullet, index) => {
      const bulletPos = new THREE.Vector3().setFromMatrixPosition(bullet.matrixWorld);
      if (clownBox.containsPoint(bulletPos)) {
        isDyingRef.current = true;
        setIsAlive(false);

        api.velocity.set(0, 0, 0);
        clownObject.removeFromParent();
        apiRef.current?.removeFromParent();

        bullet.geometry.dispose();
        bullet.removeFromParent();
        bulletsRef.current.splice(index, 1);

        setTimeout(() => onKill(id), 50);
      }
    });
  });

  // Stop animations on cleanup
  useEffect(() => {
    return () => Object.values(actions).forEach((action) => action?.stop());
  }, [actions]);

  return isAlive ? (
    <group ref={clownRef}>
      <primitive object={clonedScene} />
    </group>
  ) : null;
}