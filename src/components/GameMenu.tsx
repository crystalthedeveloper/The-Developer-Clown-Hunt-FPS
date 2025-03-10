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

export function GameMenu({ title, onSave, onRestart, onVisitPortfolio, isVisible, saving }: GameMenuProps) {
  const [error, setError] = useState(""); // Error state for saving issues
  const [statusMessage, setStatusMessage] = useState(""); // Message under the button

  if (!isVisible) return null;

  const score = useGameStore((state) => state.score);
  const kills = useGameStore((state) => state.kills);
  const gameResult = title.includes("Win") ? "win" : "lose"; // ✅ Determine game result from title

  // Handle Save with Error Handling
  const handleSave = async () => {
    setError("");
    setStatusMessage("💾 Saving...");

    try {
      await onSave(gameResult); // ✅ Pass Win/Lose to save function
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

        {/* Score & Kills Display */}
        <div className="game-stats">
          <p>🏆 Score: <strong>{score}</strong></p>
          <p>💀 Kills: <strong>{kills}</strong></p>
          <p>🎮 Result: <strong>{gameResult === "win" ? "✅ Victory!" : "❌ Defeat"}</strong></p>
        </div>

        {/* Buttons Side by Side */}
        <div className="menu-buttons">
          <button className="menu-button save" onClick={handleSave} disabled={saving}>
            {saving ? "💾 Saving..." : "💾 Save"}
          </button>
          <button className="menu-button restart" onClick={onRestart}>🔄 Restart</button>
          <button className="menu-button portfolio" onClick={onVisitPortfolio}>
            🚀 Portfolio
          </button>
        </div>

        {/* Status and Error Messages Below Buttons */}
        {statusMessage && <p className="status-message">{statusMessage}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}