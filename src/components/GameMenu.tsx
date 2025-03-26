// components/GameMenu.tsx
// This component displays the game menu, showing the current game status (win/lose), 
// the score, and options to save the game, restart, or visit the portfolio.

import { useState } from "react";
import { useGameStore } from "../store/store";
import "../css/GameMenu.css"; // Import external CSS

interface GameMenuProps {
  title: string;
  onSave: (gameResult: "win" | "lose") => Promise<void>;
  onRestart: () => void;
  onVisitPortfolio: () => void;
  isVisible: boolean;
  saving: boolean;
}

// Helper to format seconds into MM:SS
const formatPlayTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function GameMenu({ title, onSave, onRestart, onVisitPortfolio, isVisible, saving }: GameMenuProps) {
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  if (!isVisible) return null;

  const score = useGameStore((state) => state.score);
  const kills = useGameStore((state) => state.kills);
  const playTime = useGameStore((state) => state.playTime);
  const gameResult = title.includes("Win") ? "win" : "lose";

  const handleSave = async () => {
    setError("");
    setStatusMessage("💾 Saving...");
    try {
      await onSave(gameResult);
      setStatusMessage("✅ Game saved successfully!");
    } catch (err: any) {
      if (err.message.includes("403")) {
        setError("⚠️ Access Denied: You may not have permission to save.");
      } else if (err.message.includes("500")) {
        setError("❌ Server Error: Try again later.");
      } else {
        setError("❌ Unexpected error while saving. Please try again.");
      }
      setStatusMessage("");
    }
  };

  return (
    <div className="game-menu">
      <div className="game-menu-content">
        <h1 className="menu-title">{title}</h1>
        <p className="menu-subtitle">
          {gameResult === "win" ? "🎉 Congratulations!" : "👻 Try again!"}
        </p>

        {/* Game Summary */}
        <div className="game-stats">
          <p>🏆 Score: <strong className="brand">{score}</strong></p>
          <p>💀 Kills: <strong className="brand">{kills}</strong></p>
          <p>🕒 Time Played: <strong className="brand">{formatPlayTime(playTime)}</strong></p>
          <p>🎮 Result: <strong className="brand">{gameResult === "win" ? "😁 Victory!" : "Defeat"}</strong></p>
        </div>

        <button className="menu-button restart" onClick={onRestart}>🔄 Restart</button>

        <div className="menu-buttons">
          <button className="menu-button save" onClick={handleSave} disabled={saving}>
            {saving ? "💾 Saving..." : "💾 Save"}
          </button>
          <button className="menu-button portfolio" onClick={onVisitPortfolio}>
            🏢 Corporate Site
          </button>
        </div>

        {statusMessage && <p className="status-message">{statusMessage}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}