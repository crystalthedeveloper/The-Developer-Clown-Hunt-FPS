// components/GameCanvas.tsx
import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { Html, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { Ground } from "./Ground";
import { Player, PlayerRef } from "./Player";
import PlayerControls from "./PlayerControls";
import { Clown } from "./Clown";
import { LogoItem } from "./LogoItem";
import { MovableBlackBox } from "./MovableBlackBox";
import { BlackBoxes } from "./BlackBoxes";
import { DieBoxes } from "./DieBoxes";
import Scoreboard from "./Scoreboard";
import { GameMenu } from "./GameMenu";
import { useGameStore } from "../store/store";
import { SupabasePlayerStats } from "../store/SupabasePlayerStats";

function GameCanvas() {
  const playerRef = useRef<PlayerRef | null>(null);
  const bulletsRef = useRef<THREE.Mesh[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    increaseLogos,
    increaseKills,
    isGameOver,
    gameResult,
    setGameOver,
    resetGame,
    setClownData,
    logoPositions,
    setLogoPositions,
    clownData,
    totalLogos,
    totalClowns,
    totalBlackBoxes,
    totalDieBoxes,
    totalMovableBlackBoxes,
    groundSize,
    playerStartPosition,
    setPlayTime,
  } = useGameStore();

  const { scene: clownModel, animations: clownAnimations } = useGLTF("/clown.glb");
  const { scene: logosModel } = useGLTF("/logos.glb");
  const logoChildrenCount = logosModel.children.length;

  const dieSound = new Audio("/die.mp3");
  dieSound.volume = 0.8;

  const handlePlayerDie = () => {
    dieSound.currentTime = 0;
    dieSound.play().catch((e) => console.warn("❌ die.mp3 failed to play:", e));
    setGameOver("lose");
  };

  useEffect(() => {
    if (!isGameOver) {
      setPlayTime(0);
      const interval = window.setInterval(() => {
        useGameStore.setState((state) => ({ playTime: state.playTime + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isGameOver]);

  useEffect(() => {
    resetGame();

    const logos = generateUniquePositions(totalLogos, 5, 5, 0);
    const blackBoxes = generateUniquePositions(totalBlackBoxes, 5, 5, 0, logos);
    const dieBoxes = generateUniquePositions(totalDieBoxes, 5, 5, 0, [...logos, ...blackBoxes]);
    const clowns = generateUniquePositions(totalClowns, 15, 5, 0, [...logos, ...blackBoxes, ...dieBoxes], 1);

    setLogoPositions(logos);
    setClownData(
      clowns.map((pos, index) => ({
        id: index,
        position: pos,
        isAlive: true,
      }))
    );
  }, [totalLogos, totalClowns]);

  const generateUniquePositions = (
    count: number,
    minDistanceFromPlayer = 5,
    minDistanceBetweenObjects = 5,
    yPosition = 0,
    existingObjects: [number, number, number][] = [],
    minVerticalDistance = 1
  ): [number, number, number][] => {
    const positions: [number, number, number][] = [];

    const distance3D = (a: [number, number, number], b: [number, number, number]) =>
      Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let position: [number, number, number];

      do {
        position = [
          Math.random() * groundSize - groundSize / 2,
          yPosition,
          Math.random() * groundSize - groundSize / 2,
        ];

        const tooCloseToPlayer = distance3D(position, playerStartPosition) < minDistanceFromPlayer;
        const tooCloseToOthers = [...positions, ...existingObjects].some((existing) => {
          const closeXY = distance3D(existing, position) < minDistanceBetweenObjects;
          const overlapY = Math.abs(existing[1] - position[1]) < minVerticalDistance;
          return closeXY && overlapY;
        });

        if (!tooCloseToPlayer && !tooCloseToOthers) break;
        if (++attempts > 1000) break;
      } while (true);

      positions.push(position);
    }

    return positions;
  };

  const handleLogoCollect = () => {
    increaseLogos();
    const newCount = useGameStore.getState().collectedLogos + 1;
    if (newCount >= totalLogos) setGameOver("win");
  };

  const handleRestart = () => {
    resetGame();

    const logos = generateUniquePositions(totalLogos, 5, 5, 0);
    const blackBoxes = generateUniquePositions(totalBlackBoxes, 5, 5, 0, logos);
    const dieBoxes = generateUniquePositions(totalDieBoxes, 5, 5, 0, [...logos, ...blackBoxes]);
    const clowns = generateUniquePositions(totalClowns, 15, 5, 0, [...logos, ...blackBoxes, ...dieBoxes], 1);

    setLogoPositions(logos);
    setClownData(
      clowns.map((pos, index) => ({
        id: index,
        position: pos,
        isAlive: true,
      }))
    );
  };

  const handleSaveGame = async () => {
    if (!gameResult) return;

    setSaving(true);
    try {
      const { collectedLogos, playTime, kills } = useGameStore.getState();
      await SupabasePlayerStats.savePlayerStats(kills, collectedLogos, gameResult, playTime);
    } catch (err) {
      console.error("❌ Error saving game:", err);
    } finally {
      setSaving(false);
    }
  };

  if (isGameOver) {
    return (
      <GameMenu
        title={gameResult === "win" ? "🎉 You Win!" : "💀 Game Over!"}
        onRestart={handleRestart}
        onSave={handleSaveGame}
        isVisible={true}
        saving={saving}
        onVisitPortfolio={() => {
          window.open("https://www.crystalthedeveloper.ca", "_blank");
        }}
      />
    );
  }

  return (
    <>
      <Scoreboard />
      <Canvas shadows camera={{ position: [0, 10, 25], fov: 50 }} style={{ height: "100%", width: "100%" }}>
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Environment preset="studio" background backgroundBlurriness={0.3} />
          <Physics gravity={[0, -80, 0]}>
            <Player ref={playerRef} bulletsRef={bulletsRef} onDie={handlePlayerDie} />
            <Ground size={[groundSize, groundSize]} />

            {clownData.map(
              (clown) =>
                clown.isAlive && (
                  <Clown
                    key={clown.id}
                    id={clown.id}
                    playerRef={playerRef}
                    bulletsRef={bulletsRef}
                    position={clown.position}
                    model={clownModel}
                    animations={clownAnimations}
                    onKill={(id) => {
                      setClownData((prev) =>
                        prev.map((c) => (c.id === id ? { ...c, isAlive: false } : c))
                      );
                      increaseKills();
                    }}
                    onCatch={handlePlayerDie}
                  />
                )
            )}

            {logoPositions.map((position, index) => (
              <LogoItem
                key={index}
                playerRef={playerRef}
                position={[position[0], 0.5, position[2]]}
                model={logosModel}
                logoIndex={index % logoChildrenCount}
                onCollect={handleLogoCollect}
              />
            ))}

            <BlackBoxes existingPositions={generateUniquePositions(totalBlackBoxes, 5, 5, 0)} />
            <DieBoxes
              existingPositions={generateUniquePositions(totalDieBoxes, 5, 5, 0)}
              onPlayerDie={handlePlayerDie}
            />
            {[...Array(totalMovableBlackBoxes)].map((_, index) => (
              <MovableBlackBox
                key={index}
                position={[Math.random() * 30 - 15, 1, Math.random() * 30 - 15]}
                size={[1.5, 1.5, 1.5]}
              />
            ))}
          </Physics>
        </Suspense>
      </Canvas>
      <PlayerControls onShoot={() => playerRef.current?.shoot()} />
    </>
  );
}

export default GameCanvas;