"use client";

import type { Player } from "@/lib/game-store";
import { ScoreInput } from "@/components/score-input";

interface PlayerScoreRowProps {
  player: Player;
  hole: number;
  par: number;
  score: number;
  totalStrokes: number;
  onScoreChange: (score: number) => void;
}

export function PlayerScoreRow({
  player,
  par,
  score,
  totalStrokes,
  onScoreChange,
}: PlayerScoreRowProps) {
  const diff = score - par;
  const parIndicator =
    diff > 0
      ? { text: `+${diff}`, className: "text-red-500" }
      : diff < 0
        ? { text: `${diff}`, className: "text-green-600" }
        : { text: "E", className: "text-muted-foreground" };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium truncate">{player.name}</span>
        <div className="flex items-center gap-2 text-sm">
          <span className={parIndicator.className}>{parIndicator.text}</span>
          <span className="text-muted-foreground">Total: {totalStrokes}</span>
        </div>
      </div>
      <ScoreInput value={score} par={par} onChange={onScoreChange} />
    </div>
  );
}
