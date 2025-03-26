// components/Clown.tsx
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { useEffect, useRef, useMemo, useState } from "react";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";
import { PlayerRef } from "./Player";

const bloodTexture = new THREE.TextureLoader().load("/blood-splatter.png");

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
  const { camera, scene } = useThree();

  const [isAlive, setIsAlive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [canCatch, setCanCatch] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const [isGameOverTriggered, setIsGameOverTriggered] = useState(false);

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
        mesh.skeleton = new THREE.Skeleton(
          mesh.skeleton.bones.map((bone) => bonesMap[bone.name] || bone)
        );
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center); // center pivot

    return { clonedScene: clone, height: size.y };
  }, [model]);

  const { actions } = useAnimations(animations, clonedScene);

  const [apiRef, api] = useBox(() => ({
    mass: 1,
    position: [position[0], position[1] + height / 2 + 1.0, position[2]],
    args: [1, height, 1],
    fixedRotation: true,
    linearDamping: 0.6,
    angularDamping: 0.6,
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
  }));

  const playAnimation = (name: string, speed = 1) => {
    Object.values(actions).forEach((action) => action?.fadeOut(0.2));
    const selected = actions[name];
    if (selected) {
      selected.reset().fadeIn(0.2).setEffectiveTimeScale(speed).play();
    }
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

  useEffect(() => {
    return api.position.subscribe(([x, y, z]) => {
      clownRef.current?.position.set(x, Math.max(0.5, y), z);
    });
  }, [api]);

  useEffect(() => {
    return () => {
      Object.values(actions).forEach((action) => action?.stop());
    };
  }, [actions]);

  useFrame(() => {
    if (
      !isAlive ||
      isDyingRef.current ||
      !clownRef.current ||
      !playerRef.current ||
      isGameOverTriggered ||
      !isAIActive
    )
      return;

    const clown = clownRef.current;
    const clownPos = clown.position;
    const playerPos = playerRef.current.getPosition();
    const distance = clownPos.distanceTo(playerPos);

    clown.rotation.x = 0;
    clown.rotation.z = 0;
    clown.lookAt(playerPos);

    if (distance > 20) {
      if (isRunning) {
        setIsRunning(false);
        playAnimation("idle");
      }
      api.velocity.set(0, 0, 0);
      return;
    }

    if (distance <= 10) {
      const dir = new THREE.Vector3().subVectors(playerPos, clownPos).normalize();
      api.velocity.set(dir.x * 90, 0, dir.z * 96);

      if (!isRunning) {
        setIsRunning(true);
        playAnimation("run", 1.3);
      }
    } else {
      if (isRunning) {
        setIsRunning(false);
        playAnimation("idle");
      }
      api.velocity.set(0, 0, 0);
    }

    if (distance < 1.5 && canCatch && !isGameOverTriggered) {
      setIsGameOverTriggered(true);
      api.velocity.set(0, 0, 0);
      playAnimation("idle");
      onCatch();
    }

    const clownBox = new THREE.Box3().setFromObject(clown);
    bulletsRef.current.forEach((bullet, index) => {
      const bulletPos = new THREE.Vector3().setFromMatrixPosition(bullet.matrixWorld);
      if (clownBox.containsPoint(bulletPos)) {
        isDyingRef.current = true;
        setIsAlive(false);
        api.velocity.set(0, 0, 0);

        const blood = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            map: bloodTexture,
            transparent: true,
            depthWrite: false,
          })
        );

        blood.rotation.z = Math.random() * Math.PI;
        blood.scale.setScalar(1.5 + Math.random());
        blood.position.copy(bulletPos);
        blood.lookAt(camera.position);
        scene.add(blood);

        setTimeout(() => {
          blood.removeFromParent();
          blood.geometry.dispose();
          (blood.material as THREE.Material).dispose();
        }, 100);

        bullet.geometry.dispose();
        bullet.removeFromParent();
        bulletsRef.current.splice(index, 1);

        setTimeout(() => {
          clown.removeFromParent();
          apiRef.current?.removeFromParent();
          onKill(id);
        }, 100);
      }
    });
  });

  return isAlive ? (
    <group ref={clownRef}>
      <group rotation={[-Math.PI / 14, 0, 0]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  ) : null;
}