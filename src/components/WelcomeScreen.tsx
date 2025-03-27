
// components/WelcomeScreen.tsx

import React, { useEffect, useState } from "react";
import "../css/WelcomeScreen.css";

const WelcomeScreen: React.FC<{ onStart: () => void; userName: string | null }> = ({ onStart, userName }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStart = () => {
    setIsVisible(false);
    setTimeout(() => onStart(), 500);
  };

  return (
    <div className={`welcome-screen ${isVisible ? "fade-in" : "fade-out"}`}>
      <div className="welcome-box">
        <h1 className="welcome-box-header">
          Welcome, <span className="username">{userName || "Player"}</span> 🎪
        </h1>
        <p>Get ready for <strong>The Developer: Clown Hunt FPS!</strong></p>

        <div className="button-container">
          <button className="play-button" onClick={handleStart}>
            🎯 PLAY
          </button>
        </div>

        {/* Always Visible Controls Section */}
        <div className="controls fade-in">
          <h2 className="controls-header">🎮 Controls:</h2>
          <p>⬆️⬇️⬅️➡️ / WASD → Move</p>
          <p>🔫 Spacebar → Shoot</p>
          <p>🖱️ Click → Shoot</p>
          
        </div>
        <button
            className="corporate-button"
            onClick={() => window.open("https://www.crystalthedeveloper.ca/", "_blank")}
          >
            🏢 Corporate Site
          </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;