// App.tsx
import { useRef, useEffect, useState, Suspense } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { Html, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Ground } from "./components/Ground";
import { Player, PlayerRef } from "./components/Player";
import PlayerControls from "./components/PlayerControls";
import { Clown } from "./components/Clown";
import { LogoItem } from "./components/LogoItem";
import { MovableBlackBox } from "./components/MovableBlackBox";
import { BlackBoxes } from "./components/BlackBoxes";
import { DieBoxes } from "./components/DieBoxes";
import Scoreboard from "./components/Scoreboard";
import { GameMenu } from "./components/GameMenu";
import { useGameStore } from "./store/store";
import { SupabaseAuth } from "./store/SupabaseAuth";
import { SupabasePlayerStats } from "./store/SupabasePlayerStats";
import "./App.css";

type Position = [number, number, number];

const TOTAL_LOGOS = 3;
const TOTAL_CLOWNS = 8;
const TOTAL_BLACKBOXES = 10;
const TOTAL_DIEBOXES = 5;
const TOTAL_MOVABLE_BLACKBOXES = 5;

const PLAYER_START_POSITION: Position = [0, 1, 0];
export const GROUND_SIZE = 50;

const generateUniquePositions = (
  count: number,
  groundSize: number,
  existingPositions: Position[],
  minDistanceFromOthers = 5,
  yOffset = 0,
  minDistanceFromPlayer = 8
): Position[] => {
  const positions: Position[] = [];
  let attempts = 0;
  const maxAttempts = 500;
  const min = -groundSize / 2;
  const max = groundSize / 2;

  while (positions.length < count && attempts < maxAttempts) {
    attempts++;

    const newPos: Position = [
      Math.random() * (max - min) + min,
      yOffset,
      Math.random() * (max - min) + min,
    ];

    const isFarEnoughFromPlayer =
      Math.hypot(newPos[0] - PLAYER_START_POSITION[0], newPos[2] - PLAYER_START_POSITION[2]) >=
      minDistanceFromPlayer;

    const isFarEnoughFromOthers = existingPositions.every(
      (pos) => Math.hypot(pos[0] - newPos[0], pos[2] - newPos[2]) >= minDistanceFromOthers
    );

    if (isFarEnoughFromOthers && isFarEnoughFromPlayer) {
      positions.push(newPos);
      existingPositions.push(newPos);
    }
  }

  return positions;
};

function App() {
  const playerRef = useRef<PlayerRef | null>(null);
  const bulletsRef = useRef<THREE.Mesh[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const {
    increaseScore,
    increaseKills,
    isGameOver,
    gameResult,
    setGameOver,
    resetGame,
    collectedLogos,
    setCollectedLogos,
    clownData,
    setClownData,
    logoPositions,
    setLogoPositions,
    score,
    kills,
  } = useGameStore();

  const [saving, setSaving] = useState(false);
  const [blackBoxPositions, setBlackBoxPositions] = useState<Position[]>([]);
  const [dieBoxPositions, setDieBoxPositions] = useState<Position[]>([]);

  const { scene: clownModel, animations: clownAnimations } = useGLTF("/clown.glb");
  const { scene: logosModel } = useGLTF("/logos.glb");
  const logoChildrenCount = logosModel.children.length;

  // Fetch the authenticated user from Supabase
  useEffect(() => {
    async function fetchUser() {
      const user = await SupabaseAuth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || "Player");
      } else {
        setUserName("Player");
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const resetClownState = () => {
    (window as any).gameOverTriggered = false;
  };

  const handleLogoCollect = () => {
    const newCollectedCount = collectedLogos + 1;
    increaseScore(8);
    setCollectedLogos(newCollectedCount);

    if (newCollectedCount === TOTAL_LOGOS) {
      setGameOver("win");
    }
  };

  const handleRestart = () => {
    resetGame();
    resetClownState();

    const allPositions: Position[] = [PLAYER_START_POSITION];

    setLogoPositions(generateUniquePositions(TOTAL_LOGOS, GROUND_SIZE, allPositions, 3, 0.5, 8));
    setClownData(
      generateUniquePositions(TOTAL_CLOWNS, GROUND_SIZE, allPositions, 3, 0.5, 8).map((pos, index) => ({
        id: index + 1,
        position: pos,
        isAlive: true,
      }))
    );
    setBlackBoxPositions(generateUniquePositions(TOTAL_BLACKBOXES, GROUND_SIZE, allPositions, 3, 0.5, 8));
    setDieBoxPositions(generateUniquePositions(TOTAL_DIEBOXES, GROUND_SIZE, allPositions, 3, 0.5, 8));
    setCollectedLogos(0);
  };

  const handleSaveGame = async () => {
    setSaving(true);
    try {
      const user = await SupabaseAuth.getUser();
      if (!user) {
        alert("⚠️ You must be logged in to save your game.");
        setSaving(false);
        return;
      }

      const success = await SupabasePlayerStats.savePlayerStats(score, kills);
      setSaving(false);

      if (success) {
        alert("✅ Game saved successfully!");
      } else {
        alert("❌ Failed to save game. Try again.");
      }
    } catch (error) {
      alert("❌ Unexpected error occurred while saving.");
      setSaving(false);
    }
  };

  useEffect(() => {
    handleRestart();
  }, []);

  if (isGameOver) {
    return (
      <GameMenu
        title={gameResult === "win" ? "🎉 You Win!" : "💀 Game Over!"}
        onRestart={handleRestart}
        onSave={handleSaveGame}
        onVisitPortfolio={() =>
          window.open("https://www.crystalthedeveloper.ca", "_blank")
        }
        isVisible={true}
        saving={saving}
      />
    );
  }

  return (
    <>
      {/* Show Welcome Screen Until Game Starts */}
      {!gameStarted && !loading && <WelcomeScreen onStart={() => setGameStarted(true)} userName={userName} />}
      
      {gameStarted && (
        <>
          <div className="crosshair" />
          <Scoreboard />

          <Canvas
            shadows
            camera={{ position: [0, 10, 25], fov: 50 }}
            style={{ height: "100%", width: "100%" }}
          >
            <Suspense fallback={<Html center>Loading...</Html>}>
              <Environment preset="studio" background />
              <Physics gravity={[0, -50, 0]}>
                <Player ref={playerRef} bulletsRef={bulletsRef} onDie={() => setGameOver("lose")} />
                <Ground size={[GROUND_SIZE, GROUND_SIZE]} />

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
                        setClownData((prev) => prev.map((c) => (c.id === id ? { ...c, isAlive: false } : c)));
                        increaseKills();
                      }}
                      onCatch={() => setGameOver("lose")}
                    />
                  ) : null
                )}

                {logoPositions.map((position, index) => (
                  <LogoItem key={index} playerRef={playerRef} position={position} model={logosModel} logoIndex={index % logoChildrenCount} onCollect={handleLogoCollect} />
                ))}
                
                <BlackBoxes existingPositions={blackBoxPositions} />
                <DieBoxes existingPositions={dieBoxPositions} onPlayerDie={() => setGameOver("lose")} />

                {[...Array(TOTAL_MOVABLE_BLACKBOXES)].map((_, index) => (
                  <MovableBlackBox key={index} position={[Math.random() * 20 - 10, 1, Math.random() * 20 - 10]} size={[1, 1, 1]} />
                ))}
              </Physics>
            </Suspense>
          </Canvas>

          <PlayerControls onShoot={() => playerRef.current?.shoot()} />
        </>
      )}
    </>
  );
}

export default App;
