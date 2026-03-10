"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScoreInputProps {
  value: number;
  par: number;
  onChange: (score: number) => void;
  min?: number;
}

export function ScoreInput({ value, par, onChange, min = 1 }: ScoreInputProps) {
  const colorClass =
    value < par
      ? "text-green-600"
      : value > par
        ? "text-red-500"
        : "text-foreground";

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease score"
      >
        <Minus className="size-4" />
      </Button>
      <span className={`text-2xl font-bold min-w-[2ch] text-center ${colorClass}`}>
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(value + 1)}
        aria-label="Increase score"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
