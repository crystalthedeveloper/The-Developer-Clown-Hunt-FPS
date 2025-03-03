// components/GameMenu.tsx
// This component displays the game menu, showing the current game status (win/lose), 
// the score, and options to save the game, restart, or visit the portfolio.

import { useGameStore } from "../store/store";

interface GameMenuProps {
  title: string;
  onSave: () => void;
  onRestart: () => void;
  onVisitPortfolio: () => void;
  isVisible: boolean;
  saving: boolean; // ✅ Added `saving` prop
}

export function GameMenu({ title, onSave, onRestart, onVisitPortfolio, isVisible, saving }: GameMenuProps) {
  if (!isVisible) return null;

  // ✅ Get score and kills from game state
  const score = useGameStore((state) => state.score);
  const kills = useGameStore((state) => state.kills);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#222",
          color: "#fff",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#ffe600" }}>{title}</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>
          {title.includes("Win") ? "🎉 Congratulations!" : "👻 Try again!"}
        </p>

        {/* ✅ Display Score & Kills */}
        <div style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>
          <p>🏆 Score: <strong>{score}</strong></p>
          <p>💀 Kills: <strong>{kills}</strong></p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            style={{
              padding: "12px",
              fontSize: "1rem",
              cursor: saving ? "not-allowed" : "pointer",
              borderRadius: "5px",
              backgroundColor: saving ? "#aaa" : "#4CAF50",
              border: "none",
              color: "white",
            }}
            onClick={onSave}
            disabled={saving} // ✅ Uses `saving` from `App.tsx`
          >
            {saving ? "💾 Saving..." : "💾 Save Game"}
          </button>
          <button
            style={{
              padding: "12px",
              fontSize: "1rem",
              cursor: "pointer",
              borderRadius: "5px",
              backgroundColor: "#FF5733",
              border: "none",
              color: "white",
            }}
            onClick={onRestart}
          >
            🔄 Restart Game
          </button>
          <button
            style={{
              padding: "12px",
              fontSize: "1rem",
              cursor: "pointer",
              borderRadius: "5px",
              backgroundColor: "#007BFF",
              border: "none",
              color: "white",
            }}
            onClick={onVisitPortfolio}
          >
            🚀 Explore Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}