// components/Scoreboard.tsx
// This component displays the player's score and kills in a fixed position on the screen. 
// It pulls the current score and kill count directly from the game state using the `useGameStore` hook.

import { useGameStore } from "../store/store";
import "../css/Scoreboard.css"; // ✅ Import CSS file

const Scoreboard = () => {
  // ✅ Get score and kills directly from the game store
  const score = useGameStore((state) => state.score);
  const kills = useGameStore((state) => state.kills);

  return (
    <div className="scoreboard">
      <img src="./gold.png" alt="Game Logo" className="scoreboard-logo" />
      <div className="scoreboard-text">Score: <div className="scoreboard-number">{score}</div></div>
      <div className="scoreboard-text">Kills: <div className="scoreboard-number">{kills}</div></div>
    </div>
  );
};

export default Scoreboard;