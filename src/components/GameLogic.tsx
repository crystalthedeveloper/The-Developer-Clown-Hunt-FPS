// components/GameLogic.tsx
import { useGameStore } from "../store/store";

export const useGameLogic = () => {
    const { 
        increaseKills, isGameOver, gameResult, setGameOver, resetGame, 
        collectedLogos, setCollectedLogos, totalLogos 
    } = useGameStore(); // ✅ Removed increaseScore

    // ✅ Handle killing a clown (Player gets 10 points)
    const handleClownKill = (clownId: number, setClownData: Function) => {
        setClownData((prev: any) =>
            prev.map((c: any) => (c.id === clownId ? { ...c, isAlive: false } : c))
        );
        increaseKills(); // ✅ Score is automatically handled inside increaseKills
    };

    // ✅ Handle collecting a logo
    const handleLogoCollect = () => {
        const newCollectedCount = collectedLogos + 1;
        setCollectedLogos(newCollectedCount); // ✅ Score is automatically handled in store

        if (newCollectedCount === totalLogos) { 
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