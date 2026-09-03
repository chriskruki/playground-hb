"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Flag } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { useShallow } from "zustand/react/shallow";
import { HoleProgress } from "@/components/hole-progress";
import { PlayerScoreRow } from "@/components/player-score-row";
import type { HoleData } from "@/lib/holes";
import { MAX_SCORE, TOTAL_HOLES } from "@/lib/config";
import { slideHorizontal, slideTransition, tapSoft } from "@/lib/motion";

export function ScoringScreen({ holesData }: { holesData: HoleData[] }) {
  const {
    currentHole,
    players,
    scores,
    setScore,
    nextHole,
    prevHole,
    goToHole,
    goToResults,
  } = useGameStore(
    useShallow((s) => ({
      currentHole: s.currentHole,
      players: s.players,
      scores: s.scores,
      setScore: s.setScore,
      nextHole: s.nextHole,
      prevHole: s.prevHole,
      goToHole: s.goToHole,
      goToResults: s.goToResults,
    })),
  );

  const [direction, setDirection] = useState<1 | -1>(1);

  const hole = holesData[currentHole - 1];
  const isLastHole = currentHole >= TOTAL_HOLES;
  const allScored =
    players.length > 0 && players.every((p) => (scores[p.id]?.[currentHole - 1] ?? 0) > 0);

  /** Untouched holes count as 0 strokes until a score is recorded. */
  function getScore(playerId: string): number {
    return scores[playerId]?.[currentHole - 1] ?? 0;
  }

  function getTotalStrokes(playerId: string): number {
    let total = 0;
    for (let i = 0; i < holesData.length; i++) {
      total += scores[playerId]?.[i] ?? 0;
    }
    return total;
  }

  function handleNext() {
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
    <div className="flex w-full flex-col gap-4">
      <HoleProgress
        current={currentHole}
        total={TOTAL_HOLES}
        isLastHole={isLastHole}
        onPrev={handlePrev}
        onNext={handleNext}
        onGoToHole={(h) => {
          setDirection(h > currentHole ? 1 : -1);
          goToHole(h);
        }}
        onEndGame={goToResults}
      />

      <div className="overflow-x-clip">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentHole}
            custom={direction}
            variants={slideHorizontal}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col gap-4"
          >
          {/* Hole marker + name */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-primary-foreground shadow-[var(--shadow-card)]">
              <Flag className="size-3.5" strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Hole {hole.number}
              </span>
            </div>
            <h2 className="text-center text-2xl font-extrabold leading-tight">{hole.name}</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
                Par {hole.par}
              </span>
              <span className="text-xs font-medium text-muted-foreground">Max {MAX_SCORE}</span>
            </div>
          </div>

          {hole.instructions && (
            // Instructions come from trusted local hole markdown, which may embed inline HTML.
            <p
              className="text-center text-sm text-muted-foreground [&_span]:font-semibold"
              dangerouslySetInnerHTML={{ __html: hole.instructions }}
            />
          )}

          <div className="flex flex-col gap-3">
            {players.map((player, i) => (
              <PlayerScoreRow
                key={player.id}
                player={player}
                index={i}
                hole={currentHole}
                par={hole.par}
                score={getScore(player.id)}
                totalStrokes={getTotalStrokes(player.id)}
                onScoreChange={(newScore) => setScore(player.id, currentHole, newScore)}
              />
            ))}
          </div>

          <AnimatePresence initial={false}>
            {!isLastHole && allScored && (
              <motion.button
                key="next-hole"
                onClick={handleNext}
                whileTap={tapSoft}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex w-full items-center justify-center rounded-[var(--radius-playful)] bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-[var(--shadow-pop)] transition-colors hover:bg-primary/90"
              >
                Next Hole
                <ChevronRight className="ml-1 size-5" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>

          {isLastHole && (
            <button
              onClick={goToResults}
              className="w-full rounded-[var(--radius-playful)] bg-primary/10 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
            >
              See Results
            </button>
          )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
