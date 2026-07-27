"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/logo";
import { useGameStore } from "@/lib/game-store";
import { useShallow } from "zustand/react/shallow";
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
  const { phase, hydrated, backToSetup, backToLanding } = useGameStore(
    useShallow((s) => ({
      phase: s.phase,
      hydrated: s.hydrated,
      backToSetup: s.backToSetup,
      backToLanding: s.backToLanding,
    })),
  );
  const [effectiveHoles, setEffectiveHoles] = useState(holesData);
  const showNav = phase === "scoring";

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
        <div className="mx-auto flex max-w-md items-center px-4 py-3">
          {showNav ? (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={backToLanding}
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  New Game
                </button>
                <span className="text-border">|</span>
                <button
                  onClick={backToSetup}
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Edit Players
                </button>
              </div>
              <div className="flex-1 flex justify-center">
                <Logo />
              </div>
              <a
                href="https://playgroundhb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Learn More
                <ExternalLink className="size-3.5" />
              </a>
            </>
          ) : (
            <div className="flex-1 flex justify-center">
              <Logo />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-md px-4 py-8">
        {!hydrated ? (
          // Hydration guard — show nothing until sessionStorage is read
          <div className="h-32" />
        ) : (
          // Keyed remount fades each screen in; no exit animation, so the
          // scoring screen's nested AnimatePresence/layoutId can't deadlock the swap.
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {phase === "landing" && <LandingScreen />}
            {phase === "setup" && <SetupScreen />}
            {phase === "scoring" && <ScoringScreen holesData={effectiveHoles} />}
            {phase === "results" && <ResultsScreen holesData={effectiveHoles} />}
          </motion.div>
        )}
      </main>
    </div>
  );
}
