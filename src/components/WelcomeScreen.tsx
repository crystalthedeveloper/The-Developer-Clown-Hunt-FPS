
// components/WelcomeScreen.tsx

import React, { useEffect, useState } from "react";
import "../css/WelcomeScreen.css";

const WelcomeScreen: React.FC<{ onStart: () => void; userName: string | null }> = ({ onStart, userName }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStart = () => {
    setIsVisible(false);
    setTimeout(() => onStart(), 500); // Smooth fade-out before starting
  };

  return (
    <div className={`welcome-screen ${isVisible ? "fade-in" : "fade-out"}`}>
      <div className="welcome-box"> {/* 3D Glass Box */}
        <h1 className="welcome-box-header">
          Welcome, <span className="username">{userName || "Player"}</span> 🎪
        </h1>
        <p>Get ready for <strong>The Developer: Clown Hunt FPS!</strong></p>

        <div className="button-container">
          {/* 🎮 Controls Button */}
          <button className="controls-button" onClick={() => setShowControls(!showControls)}>
            🎮 Controls
          </button>

          {/* 🎯 Play Button */}
          <button className="play-button" onClick={handleStart}>
            🎯 PLAY
          </button>

          {/* 🔗 Corporate Site Button - Opens in New Tab */}
          <button
            className="corporate-button"
            onClick={() => window.open("https://www.crystalthedeveloper.ca/", "_blank")}
          >
            🏢 Corporate Site
          </button>
        </div>

        {/* Control Info (Toggles Visibility) */}
        {showControls && (
          <div className="controls fade-in">
            <h2>🎮 Controls:</h2>
            <p>⬆️⬇️⬅️➡️ / WASD → Move</p>
            <p>🔫 Spacebar → Shoot</p>
            <p>🖱️ Click → Shoot</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;