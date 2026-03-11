"use client";

import { useState, useEffect } from "react";
import { Lock, Save, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { loadParOverrides, saveParOverrides } from "@/lib/par-overrides";
import type { ParOverrides } from "@/lib/par-overrides";

// Fallback defaults matching markdown hole files (server-only loadHoles not usable here)
const DEFAULT_PARS = [3, 3, 4, 3, 3, 4, 3, 3, 3];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const [pars, setPars] = useState<number[]>(DEFAULT_PARS);
  const [saved, setSaved] = useState(false);

  // Load overrides from localStorage once authenticated
  useEffect(() => {
    if (!authenticated) return;
    const overrides = loadParOverrides();
    setPars((current) =>
      current.map((defaultPar, i) => overrides[i + 1] ?? defaultPar)
    );
  }, [authenticated]);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  }

  function handleSave() {
    const overrides: ParOverrides = {};
    pars.forEach((par, i) => {
      overrides[i + 1] = par;
    });
    saveParOverrides(overrides);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleParChange(index: number, value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    setPars((prev) => {
      const next = [...prev];
      next[index] = Math.max(1, Math.min(10, num));
      return next;
    });
  }

  // Password gate
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              Enter the admin password to configure par values.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUnlock}>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setError("");
                }}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Par configuration form
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Par Configuration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set par values for each hole. Changes apply immediately on the next
            game.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {pars.map((par, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <label
                    htmlFor={`hole-${i + 1}`}
                    className="text-sm font-medium text-foreground"
                  >
                    Hole {i + 1}
                  </label>
                  <Input
                    id={`hole-${i + 1}`}
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    value={par}
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
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <a
          href="/"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Game
        </a>
      </div>
    </div>
  );
}
