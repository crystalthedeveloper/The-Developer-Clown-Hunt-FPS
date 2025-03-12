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

function GameCanvas() {
    const playerRef = useRef<PlayerRef | null>(null);
    const bulletsRef = useRef<THREE.Mesh[]>([]);
    const [saving, setSaving] = useState(false);

    const {
        increaseScore, increaseKills, isGameOver, gameResult, setGameOver, resetGame,
        score, kills, setClownData, logoPositions, setLogoPositions,
        collectedLogos, setCollectedLogos, clownData, totalLogos, totalClowns,
        totalBlackBoxes, totalDieBoxes, totalMovableBlackBoxes, groundSize, playerStartPosition
    } = useGameStore();

    const { scene: clownModel, animations: clownAnimations } = useGLTF("/clown.glb");
    const { scene: logosModel } = useGLTF("/logos.glb");
    const logoChildrenCount = logosModel.children.length;

    // ✅ Reset game state and generate positions
    useEffect(() => {
        resetGame();

        const logoPositions = generateUniquePositions(totalLogos, 5, 5, 0);
        const blackBoxPositions = generateUniquePositions(totalBlackBoxes, 5, 5, 0, logoPositions);
        const dieBoxPositions = generateUniquePositions(totalDieBoxes, 5, 5, 0, [...logoPositions, ...blackBoxPositions]);

        // ✅ Ensure clowns don’t spawn on top of objects
        const clownPositions = generateUniquePositions(totalClowns, 15, 5, 1, [
            ...logoPositions, ...blackBoxPositions, ...dieBoxPositions
        ]);

        setLogoPositions(logoPositions);
        setClownData(clownPositions.map((pos, index) => ({
            id: index,
            position: pos,
            isAlive: true,
        })));
    }, [totalLogos, totalClowns]);

    // ✅ Improved Positioning Algorithm to avoid overlap
    const generateUniquePositions = (
        count: number,
        minDistanceFromPlayer = 5,
        minDistanceBetweenObjects = 5,
        yPosition = 0,
        existingObjects: [number, number, number][] = []
    ): [number, number, number][] => {
        const positions: [number, number, number][] = [];

        for (let i = 0; i < count; i++) {
            let position: [number, number, number];
            let isTooClose;

            do {
                position = [
                    Math.random() * groundSize - groundSize / 2,
                    yPosition,
                    Math.random() * groundSize - groundSize / 2
                ];

                const distanceToPlayer = Math.sqrt(
                    (position[0] - playerStartPosition[0]) ** 2 +
                    (position[2] - playerStartPosition[2]) ** 2
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

    // ✅ Handle logo collection
    const handleLogoCollect = () => {
        setCollectedLogos(collectedLogos + 1);
        increaseScore(5);

        if (collectedLogos + 1 === totalLogos) {
            setGameOver("win");
        }
    };

    // ✅ Restart game
    const handleRestart = () => {
        // ✅ Reset the game state
        resetGame();
    
        // ✅ Explicitly reset score, kills, and collected logos without triggering score updates
        useGameStore.setState({
            score: 0,
            kills: 0,
            collectedLogos: 0, // Ensure no extra score is added
            isGameOver: false,
            gameResult: null
        });
    
        // ✅ Regenerate positions
        setLogoPositions(generateUniquePositions(totalLogos, 5, 5, 0));
        setClownData(generateUniquePositions(totalClowns, 15, 5, 1).map((pos, index) => ({
            id: index,
            position: pos,
            isAlive: true,
        })));
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
                    <Environment preset="studio" background backgroundBlurriness={0.3} />
                    <Physics gravity={[0, -50, 0]}>
                        <Player ref={playerRef} bulletsRef={bulletsRef} onDie={() => setGameOver("lose")} />
                        <Ground size={[groundSize, groundSize]} />

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

                        {/* ✅ Render Static and Movable Boxes */}
                        <BlackBoxes existingPositions={generateUniquePositions(totalBlackBoxes, 5, 5, 0)} />
                        <DieBoxes existingPositions={generateUniquePositions(totalDieBoxes, 5, 5, 0)} onPlayerDie={() => setGameOver("lose")} />
                        {[...Array(totalMovableBlackBoxes)].map((_, index) => (
                            <MovableBlackBox key={index} position={[Math.random() * 30 - 15, 1, Math.random() * 30 - 15]} size={[1.5, 1.5, 1.5]} />
                        ))}
                    </Physics>
                </Suspense>
            </Canvas>
            <PlayerControls onShoot={() => playerRef.current?.shoot()} />
        </>
    );
}

export default GameCanvas;