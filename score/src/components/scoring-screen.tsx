"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { HoleProgress } from "@/components/hole-progress";
import { PlayerScoreRow } from "@/components/player-score-row";
import type { HoleData } from "@/lib/holes";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const slideTransition = { duration: 0.25, ease: "easeInOut" as const };

export function ScoringScreen({ holesData }: { holesData: HoleData[] }) {
  const { currentHole, players, scores, setScore, nextHole, prevHole, goToResults } =
    useGameStore(useShallow((s) => ({
      currentHole: s.currentHole,
      players: s.players,
      scores: s.scores,
      setScore: s.setScore,
      nextHole: s.nextHole,
      prevHole: s.prevHole,
      goToResults: s.goToResults,
    })));

  const [direction, setDirection] = useState<1 | -1>(1);

  const hole = holesData[currentHole - 1];
  const isLastHole = currentHole >= 9;

  /** Get score for a player on the current hole, defaulting to par */
  function getScore(playerId: string): number {
    return scores[playerId]?.[currentHole - 1] ?? hole.par;
  }

  /** Compute running total for a player across all holes */
  function getTotalStrokes(playerId: string): number {
    let total = 0;
    for (let i = 0; i < holesData.length; i++) {
      total += scores[playerId]?.[i] ?? holesData[i].par;
    }
    return total;
  }

  /** Auto-fill any unset scores for current hole with par, then advance */
  function autoFillAndAdvance() {
    for (const player of players) {
      if (scores[player.id]?.[currentHole - 1] === undefined) {
        setScore(player.id, currentHole, hole.par);
      }
    }
  }

  function handleNext() {
    autoFillAndAdvance();
    setDirection(1);
    if (isLastHole) {
      goToResults();
    } else {
      nextHole();
    }
  }

  function handlePrev() {
    setDirection(-1);
    prevHole();
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <HoleProgress current={currentHole} total={9} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentHole}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="flex flex-col gap-4"
        >
          {/* Hole header */}
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-bold text-center">
              Hole {hole.number}: {hole.name}
            </h2>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              Par {hole.par}
            </span>
          </div>

          {/* Illustration placeholder */}
          <div className="flex flex-col items-center justify-center h-32 bg-muted rounded-lg gap-1">
            <Flag className="size-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Hole {hole.number}
            </span>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground text-center">
            {hole.instructions}
          </p>

          {/* Player scores */}
          <div className="flex flex-col gap-3">
            {players.map((player) => (
              <PlayerScoreRow
                key={player.id}
                player={player}
                hole={currentHole}
                par={hole.par}
                score={getScore(player.id)}
                totalStrokes={getTotalStrokes(player.id)}
                onScoreChange={(newScore) =>
                  setScore(player.id, currentHole, newScore)
                }
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {currentHole > 1 && (
          <Button variant="outline" onClick={handlePrev} className="flex-1">
            Previous Hole
          </Button>
        )}
        <Button onClick={handleNext} className="flex-1">
          {isLastHole ? "View Results" : "Next Hole"}
        </Button>
      </div>
    </div>
  );
}
