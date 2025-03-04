// components/GameCanvas.tsx
import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { Html, Environment } from "@react-three/drei";
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
import { useGLTF } from "@react-three/drei";

export const GROUND_SIZE = 50;
export const PLAYER_START_POSITION: [number, number, number] = [0, 1, 0];

const TOTAL_LOGOS = 3;
const TOTAL_CLOWNS = 8;
const TOTAL_BLACKBOXES = 10;
const TOTAL_DIEBOXES = 5;
const TOTAL_MOVABLE_BLACKBOXES = 5;

function GameCanvas() {
    const playerRef = useRef<PlayerRef | null>(null);
    const bulletsRef = useRef<THREE.Mesh[]>([]);
    const [saving, setSaving] = useState(false);

    const {
        increaseScore, increaseKills, isGameOver, gameResult, setGameOver, resetGame,
        score, kills, setClownData, logoPositions, setLogoPositions,
        collectedLogos, setCollectedLogos, clownData
    } = useGameStore();

    const { scene: clownModel, animations: clownAnimations } = useGLTF("/clown.glb");
    const { scene: logosModel } = useGLTF("/logos.glb");
    const logoChildrenCount = logosModel.children.length;

    useEffect(() => {
        resetGame();

        setLogoPositions(generateUniquePositions(TOTAL_LOGOS, 3, 3, 0)); // ✅ Logos are on the ground
        setClownData(generateUniquePositions(TOTAL_CLOWNS, 3, 3, 1).map((pos, index) => ({
            id: index,
            position: pos,
            isAlive: true,
        })));
    }, []);


    const generateUniquePositions = (count: number, minDistanceFromPlayer = 3, minDistanceBetweenObjects = 3, yPosition = 0): [number, number, number][] => {
        const positions: [number, number, number][] = [];

        for (let i = 0; i < count; i++) {
            let position: [number, number, number];
            let isTooClose;

            do {
                position = [
                    Math.random() * GROUND_SIZE - GROUND_SIZE / 2,
                    yPosition, // ✅ Ensure objects are on the ground
                    Math.random() * GROUND_SIZE - GROUND_SIZE / 2
                ];

                const distanceToPlayer = Math.sqrt(
                    (position[0] - PLAYER_START_POSITION[0]) ** 2 +
                    (position[2] - PLAYER_START_POSITION[2]) ** 2
                );

                isTooClose = distanceToPlayer < minDistanceFromPlayer;

                // ✅ Check against all previously placed objects to prevent overlap
                for (const existing of positions) {
                    const distanceToExisting = Math.sqrt(
                        (position[0] - existing[0]) ** 2 +
                        (position[2] - existing[2]) ** 2
                    );

                    if (distanceToExisting < minDistanceBetweenObjects) {
                        isTooClose = true;
                        break;
                    }
                }
            } while (isTooClose);

            positions.push(position);
        }

        return positions;
    };





    const handleLogoCollect = () => {
        setCollectedLogos(collectedLogos + 1);
        increaseScore(8);
        if (collectedLogos + 1 === TOTAL_LOGOS) {
            setGameOver("win");
        }
    };

    const handleRestart = () => {
        resetGame(); // Resets game state

        // Reinitialize clowns
        setClownData(generateUniquePositions(TOTAL_CLOWNS, 3, 3, 1).map((pos, index) => ({
            id: index,
            position: pos,
            isAlive: true,
        })));

        // Reset collected logos if needed
        setCollectedLogos(0);
    };


    const handleSaveGame = async () => {
        setSaving(true);
        try {
            await SupabasePlayerStats.savePlayerStats(score, kills);
        } finally {
            setSaving(false);
        }
    };

    const handleVisitPortfolio = () => {
        window.location.href = "https://www.crystalthedeveloper.ca/";
    };

    if (isGameOver) {
        return (
            <GameMenu
                title={gameResult === "win" ? "🎉 You Win!" : "💀 Game Over!"}
                onRestart={handleRestart}
                onSave={handleSaveGame}
                isVisible={true}
                saving={saving}
                onVisitPortfolio={handleVisitPortfolio}
            />
        );
    }

    return (
        <>
            <Scoreboard />
            <Canvas shadows camera={{ position: [0, 10, 25], fov: 50 }} style={{ height: "100%", width: "100%" }}>
                <Suspense fallback={<Html center>Loading...</Html>}>
                    <Environment preset="studio" background />
                    <Physics gravity={[0, -50, 0]}>
                        <Player ref={playerRef} bulletsRef={bulletsRef} onDie={() => setGameOver("lose")} />
                        <Ground size={[GROUND_SIZE, GROUND_SIZE]} />

                        {/* ✅ Clown Rendering */}
                        {clownData.map((clown) =>
                            clown.isAlive ? (
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
                                    onCatch={() => setGameOver("lose")}
                                />
                            ) : null
                        )}

                        {/* ✅ Logo Rendering (Ensured to be on the ground) */}
                        {logoPositions.map((position, index) => (
                            <LogoItem
                                key={index}
                                playerRef={playerRef}
                                position={[position[0], 0.5, position[2]]} // ✅ Explicitly setting Y to 0
                                model={logosModel}
                                logoIndex={index % logoChildrenCount}
                                onCollect={handleLogoCollect}
                            />
                        ))}


                        {/* ✅ Static Objects */}
                        <BlackBoxes existingPositions={generateUniquePositions(TOTAL_BLACKBOXES, 3, 3, 0)} />
                        <DieBoxes existingPositions={generateUniquePositions(TOTAL_DIEBOXES, 3, 3, 0)} onPlayerDie={() => setGameOver("lose")} />



                        {/* ✅ Movable Black Boxes */}
                        {[...Array(TOTAL_MOVABLE_BLACKBOXES)].map((_, index) => (
                            <MovableBlackBox key={index} position={[Math.random() * 20 - 10, 1, Math.random() * 20 - 10]} size={[1, 1, 1]} />
                        ))}
                    </Physics>
                </Suspense>
            </Canvas>
            <PlayerControls onShoot={() => playerRef.current?.shoot()} />
        </>
    );
}

export default GameCanvas;