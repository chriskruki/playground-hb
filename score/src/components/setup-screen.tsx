"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SetupScreen() {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayerName = useGameStore((s) => s.updatePlayerName);
  const goToScoring = useGameStore((s) => s.goToScoring);

  const canStart =
    players.length > 0 && players.every((p) => p.name.trim().length > 0);

  function handleAdd() {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;
    addPlayer(trimmed);
    setInputValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center">Who&apos;s Playing?</h2>

      {/* Player input row */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter player name"
          autoComplete="off"
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-2">
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
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <Input
                  value={player.name}
                  onChange={(e) =>
                    updatePlayerName(player.id, e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlayer(player.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Start Scoring button */}
      <Button
        size="lg"
        className="w-full"
        disabled={!canStart}
        onClick={goToScoring}
      >
        Start Scoring
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>

      {!canStart && (
        <p className="text-sm text-muted-foreground text-center -mt-4">
          Add at least one player to continue
        </p>
      )}
    </div>
  );
}
