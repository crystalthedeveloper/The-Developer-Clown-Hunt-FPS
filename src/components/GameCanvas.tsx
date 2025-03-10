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

    // ✅ Ensure game state is reset when starting a new session
    useEffect(() => {
        resetGame();
        setLogoPositions(generateUniquePositions(TOTAL_LOGOS, 5, 3, 0));
        setClownData(generateUniquePositions(TOTAL_CLOWNS, 5, 3, 1).map((pos, index) => ({
            id: index,
            position: pos,
            isAlive: true,
        })));
    }, []);

    // Ensure objects don't overlap by checking against existing positions
    const generateUniquePositions = (
        count: number,
        minDistanceFromPlayer = 5,
        minDistanceBetweenObjects = 3,
        yPosition = 0,
        existingObjects: [number, number, number][] = [] // Added parameter to avoid overlaps
    ): [number, number, number][] => {
        const positions: [number, number, number][] = [];

        for (let i = 0; i < count; i++) {
            let position: [number, number, number];
            let isTooClose;

            do {
                position = [
                    Math.random() * GROUND_SIZE - GROUND_SIZE / 2,
                    yPosition,
                    Math.random() * GROUND_SIZE - GROUND_SIZE / 2
                ];

                const distanceToPlayer = Math.sqrt(
                    (position[0] - PLAYER_START_POSITION[0]) ** 2 +
                    (position[2] - PLAYER_START_POSITION[2]) ** 2
                );

                isTooClose = distanceToPlayer < minDistanceFromPlayer;

                for (const existing of [...positions, ...existingObjects]) {
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

    // ✅ Ensure game state is reset when starting a new session
    useEffect(() => {
        resetGame();

        // ✅ Generate positions for static objects first
        const logoPositions = generateUniquePositions(TOTAL_LOGOS, 5, 3, 0);
        const blackBoxPositions = generateUniquePositions(TOTAL_BLACKBOXES, 5, 3, 0, logoPositions);
        const dieBoxPositions = generateUniquePositions(TOTAL_DIEBOXES, 5, 3, 0, [...logoPositions, ...blackBoxPositions]);

        // ✅ Generate clown positions ensuring they don't overlap with anything
        const clownPositions = generateUniquePositions(TOTAL_CLOWNS, 5, 3, 1, [...logoPositions, ...blackBoxPositions, ...dieBoxPositions]);

        setLogoPositions(logoPositions);
        setClownData(clownPositions.map((pos, index) => ({
            id: index,
            position: pos,
            isAlive: true,
        })));
    }, []);


    // ✅ Handle logo collection and win condition
    const handleLogoCollect = () => {
        const newCollectedLogos = collectedLogos + 1;
        setCollectedLogos(newCollectedLogos);
        increaseScore(8);

        if (newCollectedLogos === TOTAL_LOGOS) {
            setGameOver("win");
        }
    };

    // ✅ Restart the game properly
    const handleRestart = () => {
        resetGame();
        setLogoPositions(generateUniquePositions(TOTAL_LOGOS, 5, 3, 0));
        setClownData(generateUniquePositions(TOTAL_CLOWNS, 5, 3, 1).map((pos, index) => ({
            id: index,
            position: pos,
            isAlive: true,
        })));
        setCollectedLogos(0);
    };

    // ✅ Save game with error handling
    const handleSaveGame = async () => {
        if (!gameResult) {
            console.error("❌ Error: No game result available to save.");
            return;
        }

        setSaving(true);
        try {
            await SupabasePlayerStats.savePlayerStats(score, kills, gameResult);
        } catch (err) {
            console.error("❌ Error saving game:", err);
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
                    <Environment preset="studio" background backgroundBlurriness={0.5} />
                    <Physics gravity={[0, -50, 0]}>
                        <Player ref={playerRef} bulletsRef={bulletsRef} onDie={() => setGameOver("lose")} />
                        <Ground size={[GROUND_SIZE, GROUND_SIZE]} />

                        {/* ✅ Render Clowns */}
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

                        {/* ✅ Render Logos */}
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

                        {/* ✅ Static Objects */}
                        <BlackBoxes existingPositions={generateUniquePositions(TOTAL_BLACKBOXES, 5, 3, 0)} />
                        <DieBoxes existingPositions={generateUniquePositions(TOTAL_DIEBOXES, 5, 3, 0)} onPlayerDie={() => setGameOver("lose")} />

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