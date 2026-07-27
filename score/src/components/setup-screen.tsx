"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRESET_COUNTS } from "@/lib/config";
import { playerAccent } from "@/lib/player-accents";
import { tap, tapSoft } from "@/lib/motion";

function PlayerCountStep({ onSelect }: { onSelect: (count: number) => void }) {
  const [custom, setCustom] = useState("");

  function handleCustomSubmit() {
    const num = parseInt(custom, 10);
    if (num > 0) onSelect(num);
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-center text-2xl font-extrabold">How many players?</h2>

      <div className="grid grid-cols-4 gap-2.5">
        {PRESET_COUNTS.map((n) => (
          <motion.button
            key={n}
            onClick={() => onSelect(n)}
            whileTap={tap}
            className="flex h-14 items-center justify-center rounded-[var(--radius-playful)] bg-primary text-2xl font-extrabold text-primary-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-primary/90"
          >
            {n}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCustomSubmit();
          }}
          placeholder="More players…"
          className="h-12 flex-1"
        />
        <Button
          variant="outline"
          onClick={handleCustomSubmit}
          disabled={!custom || parseInt(custom, 10) <= 0}
          className="h-12"
        >
          Go
        </Button>
      </div>
    </div>
  );
}

function PlayerNamesStep() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayerName = useGameStore((s) => s.updatePlayerName);
  const goToScoring = useGameStore((s) => s.goToScoring);

  const lastAddedRef = useRef<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const canStart = players.length > 0 && players.every((p) => p.name.trim().length > 0);

  useEffect(() => {
    if (players.length > 0) {
      const firstEmpty = players.find((p) => p.name === "");
      if (firstEmpty && firstEmpty.id !== lastAddedRef.current) {
        lastAddedRef.current = firstEmpty.id;
        requestAnimationFrame(() => {
          inputRefs.current[firstEmpty.id]?.focus();
        });
      }
    }
  }, [players]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-center text-2xl font-extrabold">Who&apos;s playing?</h2>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="card-playful flex items-center gap-2.5 border border-border bg-card p-2 pl-3">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: playerAccent(index) }}
                >
                  {index + 1}
                </span>
                <Input
                  ref={(el) => {
                    inputRefs.current[player.id] = el;
                  }}
                  value={player.name}
                  onChange={(e) => updatePlayerName(player.id, e.target.value)}
                  placeholder="Player name"
                  className="h-11 flex-1 border-0 bg-transparent px-1 text-base shadow-none focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlayer(player.id)}
                  aria-label={`Remove player ${index + 1}`}
                  className="size-10 text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button variant="outline" onClick={() => addPlayer("")} className="h-12 w-full">
        <Plus className="mr-2 size-4" />
        Add Player
      </Button>

      <motion.button
        whileTap={canStart ? tapSoft : undefined}
        disabled={!canStart}
        onClick={goToScoring}
        className="flex w-full items-center justify-center rounded-[var(--radius-playful)] bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-[var(--shadow-pop)] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        Start Scoring
        <ChevronRight className="ml-1 size-5" strokeWidth={2.5} />
      </motion.button>

      {!canStart && (
        <p className="-mt-4 text-center text-sm text-muted-foreground">
          Enter every player&apos;s name to start.
        </p>
      )}
    </div>
  );
}

export function SetupScreen() {
  const players = useGameStore((s) => s.players);
  const setPlayerCount = useGameStore((s) => s.setPlayerCount);

  const hasPlayers = players.length > 0;

  return (
    <AnimatePresence mode="wait">
      {!hasPlayers ? (
        <motion.div
          key="count"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <PlayerCountStep onSelect={setPlayerCount} />
        </motion.div>
      ) : (
        <motion.div
          key="names"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <PlayerNamesStep />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
