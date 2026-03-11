"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import type { HoleData } from "@/lib/holes";

interface RankedPlayer {
  id: string;
  name: string;
  totalStrokes: number;
  overUnder: number;
  rank: number;
  isWinner: boolean;
}

function computeRankings(
  players: { id: string; name: string }[],
  scores: Record<string, number[]>,
  holesData: HoleData[]
): { rankings: RankedPlayer[]; coursePar: number } {
  const coursePar = holesData.reduce((sum, h) => sum + h.par, 0);

  const sorted = players
    .map((player) => {
      let totalStrokes = 0;
      for (let i = 0; i < holesData.length; i++) {
        totalStrokes += scores[player.id]?.[i] ?? holesData[i].par;
      }
      const overUnder = totalStrokes - coursePar;
      return { ...player, totalStrokes, overUnder, rank: 0, isWinner: false };
    })
    .sort((a, b) => a.totalStrokes - b.totalStrokes);

  // Assign ranks with tie handling
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i].totalStrokes !== sorted[i - 1].totalStrokes) {
      sorted[i].rank = i + 1;
    } else {
      sorted[i].rank = sorted[i - 1].rank;
    }
  }

  // Mark winners (all rank === 1)
  for (const entry of sorted) {
    entry.isWinner = entry.rank === 1;
  }

  return { rankings: sorted, coursePar };
}

function formatOverUnder(overUnder: number) {
  if (overUnder > 0) return { text: `+${overUnder}`, className: "text-red-500" };
  if (overUnder < 0) return { text: `${overUnder}`, className: "text-green-600" };
  return { text: "E", className: "text-muted-foreground" };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const winnerVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.5 },
  },
};

// Lightweight confetti particles
const CONFETTI_COLORS = [
  "bg-primary", "bg-accent", "bg-green-500", "bg-yellow-400",
  "bg-red-400", "bg-blue-400", "bg-pink-400", "bg-orange-400",
];

function ConfettiParticles() {
  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360;
    const distance = 40 + Math.random() * 50;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    const size = 4 + Math.random() * 6;
    const rotation = Math.random() * 360;

    return (
      <motion.div
        key={i}
        className={`absolute rounded-sm ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}`}
        style={{ width: size, height: size }}
        initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          x: [0, x * 0.5, x],
          y: [0, y * 0.5 - 20, y + 10],
          rotate: [0, rotation],
          scale: [0, 1.2, 0.8],
        }}
        transition={{
          duration: 1.2,
          delay: 0.3 + Math.random() * 0.3,
          ease: "easeOut",
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
      {particles}
    </div>
  );
}

export function ResultsScreen({ holesData }: { holesData: HoleData[] }) {
  const { players, scores, goToLanding } = useGameStore(useShallow((s) => ({
    players: s.players,
    scores: s.scores,
    goToLanding: s.goToLanding,
  })));

  const { rankings, coursePar } = computeRankings(players, scores, holesData);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-2xl font-bold text-center">Results</h2>
        <p className="text-sm text-muted-foreground">
          Course Par: {coursePar}
        </p>
      </div>

      {/* Rankings list */}
      <motion.div
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {rankings.map((entry) => {
          const ou = formatOverUnder(entry.overUnder);
          const isWinner = entry.isWinner;

          return (
            <motion.div
              key={entry.id}
              variants={isWinner ? winnerVariants : rowVariants}
              className={`relative flex items-center gap-3 rounded-lg border p-4 ${
                isWinner
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "bg-card"
              }`}
            >
              {/* Confetti for winners */}
              {isWinner && <ConfettiParticles />}

              {/* Rank */}
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                {isWinner ? (
                  <Trophy className="size-6 text-primary" />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Player info */}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className={`font-medium truncate ${isWinner ? "text-primary" : ""}`}>
                  {entry.name}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {entry.totalStrokes} strokes
                  </span>
                  <span className={ou.className}>{ou.text}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Play Again */}
      <Button onClick={goToLanding} className="w-full" size="lg">
        Play Again
      </Button>
    </div>
  );
}
