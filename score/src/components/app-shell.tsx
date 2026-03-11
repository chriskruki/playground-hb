"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { useGameStore } from "@/lib/game-store";
import { LandingScreen } from "@/components/landing-screen";
import { SetupScreen } from "@/components/setup-screen";
import { ScoringScreen } from "@/components/scoring-screen";
import { ResultsScreen } from "@/components/results-screen";
import { applyParOverrides } from "@/lib/par-overrides";
import type { HoleData } from "@/lib/holes";

interface AppShellProps {
  holesData: HoleData[];
}

export function AppShell({ holesData }: AppShellProps) {
  const phase = useGameStore((s) => s.phase);
  const hydrated = useGameStore((s) => s.hydrated);
  const [effectiveHoles, setEffectiveHoles] = useState(holesData);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    useGameStore.getState().hydrate();
  }, []);

  // Apply par overrides from localStorage (client-side only, after mount)
  useEffect(() => {
    setEffectiveHoles(applyParOverrides(holesData));
  }, [holesData]);

  // Back-button interception
  useEffect(() => {
    // Push initial history entry so we have something to intercept
    window.history.pushState({ game: true }, "");

    function handlePopState() {
      const currentPhase = useGameStore.getState().phase;
      if (currentPhase !== "landing") {
        // Stay on the page — push another entry to prevent navigation away
        window.history.pushState({ game: true }, "");
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-center px-4 py-3">
          <Logo />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-md px-4 py-8">
        {!hydrated ? (
          // Hydration guard — show nothing until sessionStorage is read
          <div className="h-32" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {phase === "landing" && <LandingScreen />}
              {phase === "setup" && <SetupScreen />}
              {phase === "scoring" && (
                <ScoringScreen holesData={effectiveHoles} />
              )}
              {phase === "results" && (
                <ResultsScreen holesData={effectiveHoles} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
