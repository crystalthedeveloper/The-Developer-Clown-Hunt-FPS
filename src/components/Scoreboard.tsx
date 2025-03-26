// components/Scoreboard.tsx

import { useGameStore } from "../store/store";
import { useEffect, useState } from "react";
import "../css/Scoreboard.css";

const formatTime = (seconds: number): string => {
  if (seconds < 60) return seconds.toString();
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const Scoreboard = () => {
  const score = useGameStore((state) => state.score);
  const kills = useGameStore((state) => state.kills);

  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="scoreboard">
      <a href="https://www.crystalthedeveloper.ca">
        <img src="./gold.png" alt="Game Logo" className="scoreboard-logo" />
      </a>
      <div className="scoreboard-text">
        Time: <div className="scoreboard-number">{formatTime(secondsElapsed)}</div>
      </div>
      <div className="scoreboard-text">
        Score: <div className="scoreboard-number">{score}</div>
      </div>
      <div className="scoreboard-text">
        Kills: <div className="scoreboard-number">{kills}</div>
      </div>
    </div>
  );
};

export default Scoreboard;