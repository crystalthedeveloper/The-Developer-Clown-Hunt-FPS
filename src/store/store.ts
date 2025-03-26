// store/store.ts
// This file defines the global game state using Zustand, including the player's velocity, rotation, score, kills, and other game-related data.
// It provides methods to update and manipulate this state, such as setting velocity, rotating the player, increasing score and kills, and managing game progress.

// store/store.ts
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
  playTime: number;

  setGameOver: (result: "win" | "lose") => void;
  increaseScore: (points: number) => void;
  increaseKills: () => void;
  setCollectedLogos: (count: number | ((prev: number) => number)) => void;
  setClownData: (clowns: Clown[] | ((prev: Clown[]) => Clown[])) => void;
  setLogoPositions: (positions: Position[]) => void;
  setPlayTime: (value: number | ((prev: number) => number)) => void;
  resetPlayTime: () => void;
  resetGame: () => void;
}

export const useGameStore = create<PlayerState & GameState>()(
  subscribeWithSelector((set) => ({
    velocity: { x: 0, z: 0 },
    rotation: 0,

    groundSize: 75,
    playerStartPosition: [0, 1, 0],
    totalBlackBoxes: 20,
    totalDieBoxes: 10,
    totalMovableBlackBoxes: 10,
    totalLogos: 25,
    totalClowns: 50,

    score: 0,
    kills: 0,
    collectedLogos: 0,
    isGameOver: false,
    gameResult: null,
    clownData: [],
    logoPositions: [],
    playTime: 0,

    setVelocity: (x, z) => set(() => ({ velocity: { x, z } })),
    setRotation: (rotationOrUpdater) =>
      set((state) => ({
        rotation:
          typeof rotationOrUpdater === "function"
            ? rotationOrUpdater(state.rotation)
            : rotationOrUpdater,
      })),
    resetMovement: () => set(() => ({ velocity: { x: 0, z: 0 }, rotation: 0 })),

    setGameOver: (result) =>
      set(() => ({
        isGameOver: true,
        gameResult: result,
        velocity: { x: 0, z: 0 },
        rotation: 0,
      })),

    increaseScore: (points) =>
      set((state) => ({ score: state.score + points })),

    increaseKills: () =>
      set((state) => ({
        kills: state.kills + 1,
        score: state.score + 20,
      })),

    setCollectedLogos: (valueOrUpdater) =>
      set((state) => {
        const newCount =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(state.collectedLogos)
            : valueOrUpdater;

        return {
          collectedLogos: newCount,
          score: state.score + 40,
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

    setLogoPositions: (positions) => set(() => ({ logoPositions: positions })),

    setPlayTime: (valueOrUpdater) =>
      set((state) => ({
        playTime:
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(state.playTime)
            : valueOrUpdater,
      })),

    resetPlayTime: () => set(() => ({ playTime: 0 })),

    resetGame: () =>
      set((state) => ({
        score: 0,
        kills: 0,
        collectedLogos: 0,
        isGameOver: false,
        gameResult: null,
        clownData: [],
        logoPositions: [],
        playTime: 0,
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