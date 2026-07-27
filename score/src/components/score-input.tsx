"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { MAX_SCORE, MIN_SCORE } from "@/lib/config";
import { springPop, tap } from "@/lib/motion";

interface ScoreInputProps {
  value: number;
  par: number;
  onChange: (score: number) => void;
  min?: number;
}

export function ScoreInput({ value, par, onChange, min = MIN_SCORE }: ScoreInputProps) {
  const colorClass =
    value < par
      ? "text-score-under"
      : value > par
        ? "text-score-over"
        : "text-foreground";

  const atMin = value <= min;
  const atMax = value >= MAX_SCORE;

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        whileTap={atMin ? undefined : tap}
        onClick={() => onChange(value - 1)}
        disabled={atMin}
        aria-label="Decrease score"
        className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-card text-primary shadow-[var(--shadow-card)] transition-colors hover:bg-primary/5 disabled:opacity-30 disabled:shadow-none"
      >
        <Minus className="size-5" strokeWidth={3} />
      </motion.button>

      <div className="relative flex h-12 min-w-[2.25ch] items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 14, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -14, opacity: 0, scale: 0.7 }}
            transition={springPop}
            className={`text-4xl font-extrabold tabular-nums leading-none ${colorClass}`}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        whileTap={atMax ? undefined : tap}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        aria-label="Increase score"
        className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-card text-primary shadow-[var(--shadow-card)] transition-colors hover:bg-primary/5 disabled:opacity-30 disabled:shadow-none"
      >
        <Plus className="size-5" strokeWidth={3} />
      </motion.button>
    </div>
  );
}
