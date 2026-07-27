"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { useShallow } from "zustand/react/shallow";
import type { HoleData } from "@/lib/holes";
import { playerAccent } from "@/lib/player-accents";
import { staggerContainer, staggerItem, tapSoft } from "@/lib/motion";

interface RankedPlayer {
  id: string;
  name: string;
  index: number;
  totalStrokes: number;
  overUnder: number;
  rank: number;
  isWinner: boolean;
}

function computeRankings(
  players: { id: string; name: string }[],
  scores: Record<string, number[]>,
  holesData: HoleData[],
): { rankings: RankedPlayer[]; coursePar: number } {
  const coursePar = holesData.reduce((sum, h) => sum + h.par, 0);

  const sorted = players
    .map((player, index) => {
      let totalStrokes = 0;
      for (let i = 0; i < holesData.length; i++) {
        totalStrokes += scores[player.id]?.[i] ?? holesData[i].par;
      }
      return {
        ...player,
        index,
        totalStrokes,
        overUnder: totalStrokes - coursePar,
        rank: 0,
        isWinner: false,
      };
    })
    .sort((a, b) => a.totalStrokes - b.totalStrokes);

  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i].totalStrokes !== sorted[i - 1].totalStrokes) {
      sorted[i].rank = i + 1;
    } else {
      sorted[i].rank = sorted[i - 1].rank;
    }
  }
  for (const entry of sorted) entry.isWinner = entry.rank === 1;

  return { rankings: sorted, coursePar };
}

function formatOverUnder(overUnder: number) {
  if (overUnder > 0) return { text: `+${overUnder}`, className: "text-score-over" };
  if (overUnder < 0) return { text: `${overUnder}`, className: "text-score-under" };
  return { text: "Even", className: "text-score-even" };
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <span className={className}>{display}</span>;
}

const CONFETTI_COLORS = ["#1f4f38", "#e9b949", "#ec3c28", "#2f6fb0", "#e07a2c", "#c14b8a"];

function ConfettiBurst() {
  const particles = Array.from({ length: 26 }, (_, i) => {
    const angle = (i / 26) * 360;
    const distance = 60 + ((i * 37) % 70);
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    const size = 5 + ((i * 13) % 7);
    const rotation = (i * 47) % 360;

    return (
      <motion.span
        key={i}
        className="absolute rounded-sm"
        style={{ width: size, height: size, backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
        initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          x: [0, x * 0.6, x],
          y: [0, y * 0.6 - 30, y + 20],
          rotate: [0, rotation],
          scale: [0, 1.2, 0.7],
        }}
        transition={{ duration: 1.4, delay: 0.2 + (i % 6) * 0.04, ease: "easeOut" }}
      />
    );
  });

  return (
    <div className="celebration-only pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles}
    </div>
  );
}

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="size-7 text-[#c99a1f]" strokeWidth={2.25} />;
  if (rank === 2) return <Medal className="size-6 text-[#9aa0a6]" strokeWidth={2.25} />;
  if (rank === 3) return <Medal className="size-6 text-[#c8853f]" strokeWidth={2.25} />;
  return <span className="text-xl font-extrabold text-muted-foreground tabular-nums">{rank}</span>;
}

/** Mascot cheer — renders /mascot.png if supplied, hides itself gracefully otherwise. */
function MascotCheer() {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <motion.img
      // eslint-disable-next-line @next/next/no-img-element
      src="/mascot.png"
      alt=""
      aria-hidden
      onError={() => setOk(false)}
      className="celebration-only h-16 w-auto"
      initial={{ opacity: 0, y: 10, rotate: -6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.25 }}
    />
  );
}

export function ResultsScreen({ holesData }: { holesData: HoleData[] }) {
  const { players, scores, goToLanding } = useGameStore(
    useShallow((s) => ({
      players: s.players,
      scores: s.scores,
      goToLanding: s.goToLanding,
    })),
  );

  const { rankings, coursePar } = computeRankings(players, scores, holesData);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <MascotCheer />
        <h2 className="text-3xl font-extrabold tracking-tight">Final Scores</h2>
        <p className="text-sm font-medium text-muted-foreground">
          Course par {coursePar} · {holesData.length} holes
        </p>
      </div>

      <motion.div
        className="flex flex-col gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {rankings.map((entry) => {
          const ou = formatOverUnder(entry.overUnder);
          const isWinner = entry.isWinner;

          return (
            <motion.div
              key={entry.id}
              variants={staggerItem}
              className={`card-playful relative flex items-center gap-3 border p-4 ${
                isWinner
                  ? "border-secondary bg-secondary/10 shadow-[var(--shadow-pop)]"
                  : "border-border bg-card"
              }`}
            >
              {isWinner && <ConfettiBurst />}

              <div className="relative flex size-9 shrink-0 items-center justify-center">
                <RankMark rank={entry.rank} />
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: playerAccent(entry.index) }}
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col">
                  <span className={`truncate font-bold ${isWinner ? "text-primary" : ""}`}>
                    {entry.name}
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${ou.className}`}>
                    {ou.text} to par
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end">
                <CountUp
                  value={entry.totalStrokes}
                  className="text-2xl font-extrabold tabular-nums leading-none"
                />
                <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                  strokes
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.button
        onClick={goToLanding}
        whileTap={tapSoft}
        className="w-full rounded-[var(--radius-playful)] bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-[var(--shadow-pop)] transition-colors hover:bg-primary/90"
      >
        Play Again
      </motion.button>
    </div>
  );
}
