"use client";

import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { loadParOverrides, saveParOverrides } from "@/lib/par-overrides";
import type { ParOverrides } from "@/lib/par-overrides";

interface ParFormProps {
  /** Hole pars from the markdown content — the source of truth we seed from. */
  holes: { number: number; name: string; par: number }[];
}

export function ParForm({ holes }: ParFormProps) {
  const [pars, setPars] = useState<number[]>(() => holes.map((h) => h.par));
  const [saved, setSaved] = useState(false);

  // Layer any saved overrides on top of the true markdown pars.
  useEffect(() => {
    const overrides = loadParOverrides();
    setPars(holes.map((h) => overrides[h.number] ?? h.par));
  }, [holes]);

  function handleParChange(index: number, value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    setPars((prev) => {
      const next = [...prev];
      next[index] = Math.max(1, Math.min(10, num));
      return next;
    });
  }

  function handleSave() {
    const overrides: ParOverrides = {};
    holes.forEach((h, i) => {
      overrides[h.number] = pars[i];
    });
    saveParOverrides(overrides);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {holes.map((hole, i) => (
            <div key={hole.number} className="flex items-center justify-between gap-4">
              <label htmlFor={`hole-${hole.number}`} className="min-w-0 text-sm font-medium">
                <span className="text-muted-foreground">Hole {hole.number}</span>
                <span className="ml-2 truncate">{hole.name}</span>
              </label>
              <Input
                id={`hole-${hole.number}`}
                type="number"
                min={1}
                max={10}
                step={1}
                value={pars[i]}
                onChange={(e) => handleParChange(i, e.target.value)}
                className="w-20 text-center"
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full" disabled={saved}>
          {saved ? (
            <>
              <Check className="size-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save par values
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
