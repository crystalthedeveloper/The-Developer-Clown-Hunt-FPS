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
  const movementInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressedKeys = useRef<Set<string>>(new Set());

  // ✅ Handle keyboard input (Arrow keys, WASD, and Spacebar for shooting)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!pressedKeys.current.has(e.key)) {
      pressedKeys.current.add(e.key);
      startUpdatingMovement();
    }

    if (e.key === " ") {
      onShoot();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    pressedKeys.current.delete(e.key);
    if (pressedKeys.current.size === 0 && movementInterval.current) {
      clearInterval(movementInterval.current);
      movementInterval.current = null;
      setVelocity(0, 0);
    }
  };

  const startUpdatingMovement = () => {
    if (movementInterval.current !== null) return;
    movementInterval.current = setInterval(updateMovement, 16);
  };

  const updateMovement = () => {
    let moveX = 0;
    let moveZ = 0;
    let rotationChange = 0;

    if (pressedKeys.current.has("ArrowUp") || pressedKeys.current.has("w")) moveZ -= 1;
    if (pressedKeys.current.has("ArrowDown") || pressedKeys.current.has("s")) moveZ += 1;
    if (pressedKeys.current.has("ArrowLeft") || pressedKeys.current.has("a")) rotationChange += 0.03;
    if (pressedKeys.current.has("ArrowRight") || pressedKeys.current.has("d")) rotationChange -= 0.03;

    if (moveZ !== 0 || moveX !== 0) setVelocity(moveX * 3.5, moveZ * 3.5);
    if (rotationChange !== 0) setRotation((prev) => prev + rotationChange);
  };

  // ✅ Mobile Controls: Hold button to move and stop on release
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
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // ✅ Disable right-click context menu
    const disableContextMenu = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);

    // ✅ Prevent selecting all text (Ctrl + A) & double-click selection
    const disableSelection = (event: Event) => event.preventDefault();
    document.addEventListener("selectstart", disableSelection);
    document.addEventListener("mousedown", disableSelection);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("selectstart", disableSelection);
      document.removeEventListener("mousedown", disableSelection);

      if (movementInterval.current) clearInterval(movementInterval.current);
      if (rotationInterval.current) clearInterval(rotationInterval.current);
    };
  }, []);

  return (
    <>
      {/* Controls on Left Side */}
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

      {/* Shooting Button on Right Side */}
      <div className="shoot-container">
        <button onMouseDown={onShoot} onTouchStart={onShoot}>🔫</button>
      </div>
    </>
  );
};

export default PlayerControls;