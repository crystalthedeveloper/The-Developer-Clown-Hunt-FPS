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
  const pressedKeys = useRef<Set<string>>(new Set());
  const movementInterval = useRef<number | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    pressedKeys.current.add(e.key);
    if (e.key === " ") onShoot();
    startUpdatingMovement();
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    pressedKeys.current.delete(e.key);
    if (pressedKeys.current.size === 0 && movementInterval.current) {
      clearInterval(movementInterval.current);
      movementInterval.current = null;
      setVelocity(0, 0); // Only stop velocity, not rotation!
    }
  };

  const startUpdatingMovement = () => {
    if (movementInterval.current !== null) return;
    movementInterval.current = window.setInterval(updateMovement, 16);
  };

  const updateMovement = () => {
    let moveX = 0;
    let moveZ = 0;
    let rotationChange = 0;

    if (pressedKeys.current.has("ArrowUp") || pressedKeys.current.has("w")) moveZ -= 1;
    if (pressedKeys.current.has("ArrowDown") || pressedKeys.current.has("s")) moveZ += 1;
    if (pressedKeys.current.has("ArrowLeft") || pressedKeys.current.has("a")) rotationChange += 0.03;
    if (pressedKeys.current.has("ArrowRight") || pressedKeys.current.has("d")) rotationChange -= 0.03;

    const length = Math.hypot(moveX, moveZ);
    if (length > 0) {
      moveX /= length;
      moveZ /= length;
    }

    setVelocity(moveX * 3.5, moveZ * 3.5);
    if (rotationChange !== 0) {
      setRotation((prev) => prev + rotationChange);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (movementInterval.current !== null) clearInterval(movementInterval.current);
    };
  }, []);

  // Handle Mouse Click/Hold Buttons
  const handleButtonMovementHold = (moveZ: number) => {
    const interval = setInterval(() => setVelocity(0, moveZ * 3.5), 16);
    const stopInterval = () => {
      clearInterval(interval);
      setVelocity(0, 0);
      window.removeEventListener("mouseup", stopInterval);
    };
    window.addEventListener("mouseup", stopInterval);
  };

  const handleRotateHold = (rotationChange: number) => {
    const interval = setInterval(() => setRotation((prev) => prev + rotationChange), 16);
    const stopInterval = () => {
      clearInterval(interval);
      window.removeEventListener("mouseup", stopInterval);
    };
    window.addEventListener("mouseup", stopInterval);
  };

  return (
    <div className="controls-container">
      <div>
        <button onMouseDown={() => handleButtonMovementHold(-1)}>⬆️</button>
      </div>

      <div>
        <button onMouseDown={() => handleRotateHold(0.03)}>⬅️</button>
        <button onMouseDown={onShoot}>🔫</button>
        <button onMouseDown={() => handleRotateHold(-0.03)}>➡️</button>
      </div>

      <div>
        <button onMouseDown={() => handleButtonMovementHold(1)}>⬇️</button>
      </div>
    </div>
  );
};

export default PlayerControls;