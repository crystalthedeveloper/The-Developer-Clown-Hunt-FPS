// components/GameMenu.tsx
import { useState } from "react";
import { useGameStore } from "../store/store";
import "../css/GameMenu.css";

interface GameMenuProps {
  title: string;
  onSave: (gameResult: "win" | "lose") => Promise<void>;
  onRestart: () => void;
  onVisitPortfolio: () => void;
  isVisible: boolean;
  saving: boolean;
}

const formatPlayTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function GameMenu({
  title,
  onSave,
  onRestart,
  onVisitPortfolio,
  isVisible,
  saving,
}: GameMenuProps) {
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const { kills, collectedLogos, playTime } = useGameStore.getState();
  const gameResult = title.includes("Win") ? "win" : "lose";
  const logoScore = collectedLogos * 40;
  const killScore = kills * 20;

  if (!isVisible) return null;

  const handleSave = async () => {
    setError("");
    setStatus("💾 Saving...");
    try {
      await onSave(gameResult);
      setStatus("✅ Game saved successfully!");
    } catch (err: any) {
      const msg = err?.message || "";
      setError(
        msg.includes("403")
          ? "⚠️ Access Denied: You may not have permission to save."
          : msg.includes("500")
          ? "❌ Server Error: Try again later."
          : "❌ Unexpected error while saving. Please try again."
      );
      setStatus("");
    }
  };

  return (
    <div className="game-menu">
      <div className="game-menu-content">
        <h1 className="menu-title">{title}</h1>
        <p className="menu-subtitle">
          {gameResult === "win" ? "🎉 Congratulations!" : "👻 Try again!"}
        </p>

        <div className="game-stats">
        <p>🕒 Time: <strong className="brand">{formatPlayTime(playTime)}</strong></p>
          <p>✨ Logos: <strong className="brand">{logoScore}</strong></p>
          <p>💥 Clowns: <strong className="brand">{killScore}</strong></p>
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

        {status && <p className="status-message">{status}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}