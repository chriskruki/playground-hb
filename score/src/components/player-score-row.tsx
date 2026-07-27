"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Player } from "@/lib/game-store";
import { ScoreInput } from "@/components/score-input";
import { playerAccent } from "@/lib/player-accents";
import { springPop } from "@/lib/motion";

interface PlayerScoreRowProps {
  player: Player;
  index: number;
  hole: number;
  par: number;
  score: number;
  totalStrokes: number;
  onScoreChange: (score: number) => void;
}

export function PlayerScoreRow({
  player,
  index,
  par,
  score,
  totalStrokes,
  onScoreChange,
}: PlayerScoreRowProps) {
  const diff = score - par;
  const parIndicator =
    diff > 0
      ? { text: `+${diff}`, className: "bg-score-over/10 text-score-over" }
      : diff < 0
        ? { text: `${diff}`, className: "bg-score-under/10 text-score-under" }
        : { text: "Even", className: "bg-muted text-score-even" };

  const isAce = score === 1;
  const accent = playerAccent(index);

  return (
    <div className="card-playful flex items-center justify-between gap-3 border border-border bg-card p-3 pl-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-semibold leading-tight">{player.name}</span>
          <div className="flex items-center gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-semibold tabular-nums ${parIndicator.className}`}>
              {parIndicator.text}
            </span>
            <span className="text-muted-foreground tabular-nums">Total {totalStrokes}</span>
            <AnimatePresence>
              {isAce && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={springPop}
                  className="inline-flex items-center gap-0.5 rounded-full bg-celebrate/25 px-2 py-0.5 font-bold text-[#7a5a10]"
                >
                  <Sparkles className="size-3" />
                  Ace!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <ScoreInput value={score} par={par} onChange={onScoreChange} />
    </div>
  );
}
