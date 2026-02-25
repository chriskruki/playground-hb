import { create } from "zustand";
import { loadGameState, saveGameState, clearGameState } from "./storage";

export type GamePhase = "landing" | "setup" | "scoring" | "results";

export interface Player {
  id: string;
  name: string;
}

interface GameState {
  phase: GamePhase;
  players: Player[];
  currentHole: number;
  scores: Record<string, number[]>;
  hydrated: boolean;

  // Phase transitions
  goToSetup: () => void;
  goToScoring: () => void;
  goToResults: () => void;
  goToLanding: () => void;

  // Scoring actions
  setScore: (playerId: string, hole: number, score: number) => void;
  nextHole: () => void;
  prevHole: () => void;

  // Player actions
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;

  // Hydration
  hydrate: () => void;
}

let hydrated = false;

export const useGameStore = create<GameState>((set, get) => ({
    phase: "landing",
    players: [],
    currentHole: 1,
    scores: {},
    hydrated: false,

    goToSetup() {
      if (get().phase !== "landing") {
        console.warn("[game-store] goToSetup called from non-landing phase");
        return;
      }
      set({ phase: "setup" });
    },

    goToScoring() {
      const { phase, players } = get();
      if (phase !== "setup") {
        console.warn("[game-store] goToScoring called from non-setup phase");
        return;
      }
      const validPlayers = players.filter((p) => p.name.trim().length > 0);
      if (validPlayers.length === 0) {
        console.warn("[game-store] goToScoring requires at least one player");
        return;
      }
      const scores: Record<string, number[]> = {};
      validPlayers.forEach((p) => {
        scores[p.id] = [];
      });
      set({ phase: "scoring", players: validPlayers, scores, currentHole: 1 });
    },

    goToResults() {
      if (get().phase !== "scoring") {
        console.warn("[game-store] goToResults called from non-scoring phase");
        return;
      }
      set({ phase: "results" });
    },

    goToLanding() {
      if (get().phase !== "results") {
        console.warn("[game-store] goToLanding called from non-results phase");
        return;
      }
      clearGameState();
      set({ phase: "landing", players: [], currentHole: 1, scores: {} });
    },

    setScore(playerId, hole, score) {
      const scores = { ...get().scores };
      const playerScores = [...(scores[playerId] ?? [])];
      playerScores[hole - 1] = score;
      scores[playerId] = playerScores;
      set({ scores });
    },

    nextHole() {
      const { currentHole } = get();
      if (currentHole < 9) set({ currentHole: currentHole + 1 });
    },

    prevHole() {
      const { currentHole } = get();
      if (currentHole > 1) set({ currentHole: currentHole - 1 });
    },

    addPlayer(name) {
      const id = `player-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      set({ players: [...get().players, { id, name }] });
    },

    removePlayer(id) {
      set({ players: get().players.filter((p) => p.id !== id) });
    },

    updatePlayerName(id, name) {
      set({
        players: get().players.map((p) => (p.id === id ? { ...p, name } : p)),
      });
    },

    hydrate() {
      if (hydrated) return;
      hydrated = true;
      const saved = loadGameState();
      if (saved) {
        set({
          phase: saved.phase,
          players: saved.players,
          currentHole: saved.currentHole,
          scores: saved.scores,
          hydrated: true,
        });
      } else {
        set({ hydrated: true });
      }
    },
}));

// Auto-persist to sessionStorage on every state change (after hydration)
useGameStore.subscribe((state) => {
  if (!state.hydrated) return;
  saveGameState({
    phase: state.phase,
    players: state.players,
    currentHole: state.currentHole,
    scores: state.scores,
  });
});
