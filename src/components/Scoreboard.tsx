// components/Scoreboard.tsx
// This component displays the player's score and kills in a fixed position on the screen. 
// It pulls the current score and kill count directly from the game state using the `useGameStore` hook.

import { useGameStore } from "../store/store"; // ✅ Import game state

const Scoreboard = () => {
  // ✅ Get score and kills directly from the game store
  const score = useGameStore((state) => state.score);
  const kills = useGameStore((state) => state.kills);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        padding: "10px 20px",
        borderRadius: "10px",
        color: "#ffe600",
        fontSize: "18px",
        textAlign: "center",
        zIndex: 10,
      }}
    >
      <img
        src="./gold.png"
        alt="Game Logo"
        style={{ width: 174, height: 100, marginBottom: 10 }}
      />
      <div>Score: {score}</div> {/* ✅ Read from `useGameStore` */}
      <div>Kills: {kills}</div> {/* ✅ Read from `useGameStore` */}
    </div>
  );
};

export default Scoreboard;