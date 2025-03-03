// components/GameMenu.tsx
// This component displays the game menu, showing the current game status (win/lose), 
// the score, and options to save the game, restart, or visit the portfolio.

// components/GameMenu.tsx
import { useGameStore } from "../store/store";
import "../css/GameMenu.css"; // Import external CSS

interface GameMenuProps {
  title: string;
  onSave: () => void;
  onRestart: () => void;
  onVisitPortfolio: () => void;
  isVisible: boolean;
  saving: boolean;
}

export function GameMenu({ title, onSave, onRestart, onVisitPortfolio, isVisible, saving }: GameMenuProps) {
  if (!isVisible) return null;

  const score = useGameStore((state) => state.score);
  const kills = useGameStore((state) => state.kills);

  return (
    <div className="game-menu">
      <div className="game-menu-content">
        <h1 className="menu-title">{title}</h1>
        <p className="menu-subtitle">
          {title.includes("Win") ? "🎉 Congratulations!" : "👻 Try again!"}
        </p>

        {/* Score & Kills Display */}
        <div className="game-stats">
          <p>🏆 Score: <strong>{score}</strong></p>
          <p>💀 Kills: <strong>{kills}</strong></p>
        </div>

        {/* Buttons Side by Side */}
        <div className="menu-buttons">
          <button className="menu-button save" onClick={onSave} disabled={saving}>
            {saving ? "💾 Saving..." : "💾 Save"}
          </button>
          <button className="menu-button restart" onClick={onRestart}>🔄 Restart</button>
          <button className="menu-button portfolio" onClick={onVisitPortfolio}>🚀 Portfolio</button>
        </div>
      </div>
    </div>
  );
}