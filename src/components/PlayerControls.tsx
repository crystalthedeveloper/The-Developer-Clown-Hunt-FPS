// components/PlayerControls.tsx
// This component handles player input for movement and shooting. It listens for key presses 
// (arrow keys, WASD) and mouse click/hold events to update the player's velocity and rotation.
// It also includes a shoot action tied to the space bar and mouse button press.

import React, { useEffect, useRef } from "react";
import { useGameStore } from "../store/store";
import "../css/PlayerControls.css";

interface PlayerControlsProps {
  onShoot: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ onShoot }) => {
  const { setVelocity, setRotation } = useGameStore();
  const movementInterval = useRef<NodeJS.Timeout | null>(null);
  const rotationInterval = useRef<NodeJS.Timeout | null>(null);

  const handleStartMoving = (moveZ: number) => {
    if (movementInterval.current) return;
    movementInterval.current = setInterval(() => setVelocity(0, moveZ * 3.5), 16);
  };

  const handleStopMoving = () => {
    if (movementInterval.current) {
      clearInterval(movementInterval.current);
      movementInterval.current = null;
    }
    setVelocity(0, 0);
  };

  const handleStartRotating = (rotationChange: number) => {
    if (rotationInterval.current) return;
    rotationInterval.current = setInterval(() => setRotation((prev) => prev + rotationChange), 16);
  };

  const handleStopRotating = () => {
    if (rotationInterval.current) {
      clearInterval(rotationInterval.current);
      rotationInterval.current = null;
    }
  };

  useEffect(() => {
    // Disable right-click context menu
    const disableContextMenu = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      if (movementInterval.current) clearInterval(movementInterval.current);
      if (rotationInterval.current) clearInterval(rotationInterval.current);
    };
  }, []);

  return (
    <div className="controls-container">
      <div>
        <button
          onMouseDown={() => handleStartMoving(-1)}
          onTouchStart={() => handleStartMoving(-1)}
          onMouseUp={handleStopMoving}
          onTouchEnd={handleStopMoving}
        >
          ⬆️
        </button>
      </div>

      <div>
        <button
          onMouseDown={() => handleStartRotating(0.03)}
          onTouchStart={() => handleStartRotating(0.03)}
          onMouseUp={handleStopRotating}
          onTouchEnd={handleStopRotating}
        >
          ⬅️
        </button>
        <button onMouseDown={onShoot} onTouchStart={onShoot}>
          🔫
        </button>
        <button
          onMouseDown={() => handleStartRotating(-0.03)}
          onTouchStart={() => handleStartRotating(-0.03)}
          onMouseUp={handleStopRotating}
          onTouchEnd={handleStopRotating}
        >
          ➡️
        </button>
      </div>

      <div>
        <button
          onMouseDown={() => handleStartMoving(1)}
          onTouchStart={() => handleStartMoving(1)}
          onMouseUp={handleStopMoving}
          onTouchEnd={handleStopMoving}
        >
          ⬇️
        </button>
      </div>
    </div>
  );
};

export default PlayerControls;