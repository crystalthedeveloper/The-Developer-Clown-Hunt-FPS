// store/store.ts
// This file defines the global game state using Zustand, including the player's velocity, rotation, score, kills, and other game-related data.
// It provides methods to update and manipulate this state, such as setting velocity, rotating the player, increasing score and kills, and managing game progress.

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type Position = [number, number, number];

interface Clown {
  id: number;
  position: Position;
  isAlive: boolean;
}

interface PlayerState {
  velocity: { x: number; z: number };
  rotation: number;
  setVelocity: (x: number, z: number) => void;
  setRotation: (rotation: number | ((prev: number) => number)) => void;
  resetMovement: () => void;
}

interface GameState {
  score: number;
  kills: number;
  collectedLogos: number;
  totalLogos: number;
  totalClowns: number;
  totalBlackBoxes: number;
  totalDieBoxes: number;
  totalMovableBlackBoxes: number;
  groundSize: number;
  playerStartPosition: Position;
  isGameOver: boolean;
  gameResult: "win" | "lose" | null;
  clownData: Clown[];
  logoPositions: Position[];

  setGameOver: (result: "win" | "lose") => void;
  increaseScore: (points: number) => void;
  increaseKills: () => void;
  setCollectedLogos: (count: number | ((prev: number) => number)) => void;
  setClownData: (clowns: Clown[] | ((prev: Clown[]) => Clown[])) => void;
  setLogoPositions: (positions: Position[]) => void;
  resetGame: () => void;
}

export const useGameStore = create<PlayerState & GameState>()(
  subscribeWithSelector((set) => ({
    // ✅ Player movement state
    velocity: { x: 0, z: 0 },
    rotation: 0,

    // ✅ Game World Settings stored in Zustand
    groundSize: 75, // 🔥 Game world size
    playerStartPosition: [0, 1, 0], // 🔥 Player spawn location
    totalBlackBoxes: 20, 
    totalDieBoxes: 10,  
    totalMovableBlackBoxes: 10,
    totalLogos: 25,
    totalClowns: 50, 

    // ✅ Game state variables
    score: 0,
    kills: 0,
    collectedLogos: 0,
    isGameOver: false,
    gameResult: null,
    clownData: [],
    logoPositions: [],

    // ✅ Player movement methods (Fix for missing functions)
    setVelocity: (x, z) =>
      set(() => ({
        velocity: { x, z },
      })),

    setRotation: (rotationOrUpdater) =>
      set((state) => ({
        rotation:
          typeof rotationOrUpdater === "function"
            ? rotationOrUpdater(state.rotation)
            : rotationOrUpdater,
      })),

    resetMovement: () =>
      set(() => ({
        velocity: { x: 0, z: 0 },
        rotation: 0,
      })),

    // ✅ Game state methods
    setGameOver: (result) =>
      set(() => ({
        isGameOver: true,
        gameResult: result,
        velocity: { x: 0, z: 0 },
        rotation: 0,
      })),

    increaseScore: (points) =>
      set((state) => ({
        score: state.score + points,
      })),

    increaseKills: () =>
      set((state) => ({
        kills: state.kills + 1,
        score: state.score + 20, // ✅ Increased score per kill
      })),

    setCollectedLogos: (valueOrUpdater) =>
      set((state) => {
        const newCount =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(state.collectedLogos)
            : valueOrUpdater;

        return {
          collectedLogos: newCount,
          score: state.score + 40, // ✅ Increased score per logo
          isGameOver: newCount >= state.totalLogos,
          gameResult: newCount >= state.totalLogos ? "win" : state.gameResult,
        };
      }),

    setClownData: (valueOrUpdater) =>
      set((state) => ({
        clownData:
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(state.clownData)
            : valueOrUpdater,
      })),

    setLogoPositions: (positions) =>
      set(() => ({
        logoPositions: positions,
      })),

    // ✅ Reset game state
    resetGame: () =>
      set((state) => ({
        score: 0,
        kills: 0,
        collectedLogos: 0,
        isGameOver: false,
        gameResult: null,
        clownData: [],
        logoPositions: [],
        velocity: { x: 0, z: 0 },
        rotation: 0,
        totalLogos: state.totalLogos,
        totalClowns: state.totalClowns,
        totalBlackBoxes: state.totalBlackBoxes,
        totalDieBoxes: state.totalDieBoxes,
        totalMovableBlackBoxes: state.totalMovableBlackBoxes,
      })),
  }))
);