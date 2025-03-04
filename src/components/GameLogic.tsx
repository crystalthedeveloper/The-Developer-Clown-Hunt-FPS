// components/GameLogic.tsx
import { useGameStore } from "../store/store";

export const useGameLogic = () => {
    const { 
        increaseScore, increaseKills, isGameOver, gameResult, setGameOver, resetGame, 
        collectedLogos, setCollectedLogos 
    } = useGameStore();

    // ✅ Handle killing a clown (Player gets 10 points)
    const handleClownKill = (clownId: number, setClownData: Function) => {
        setClownData((prev: any) =>
            prev.map((c: any) => (c.id === clownId ? { ...c, isAlive: false } : c))
        );
        increaseKills();
        increaseScore(10); // ✅ Increase score when a clown is killed
    };

    // ✅ Handle collecting a logo
    const handleLogoCollect = () => {
        const newCollectedCount = collectedLogos + 1;
        increaseScore(8); // ✅ Each logo gives 8 points
        setCollectedLogos(newCollectedCount);

        if (newCollectedCount === 3) {
            setGameOver("win");
        }
    };

    // ✅ Handle when player loses the game
    const handlePlayerLose = () => {
        setGameOver("lose");
    };

    // ✅ Handle restarting the game
    const handleRestart = () => {
        resetGame();
    };

    return {
        handleRestart,
        isGameOver,
        gameResult,
        handleClownKill,
        handleLogoCollect,
        handlePlayerLose
    };
};