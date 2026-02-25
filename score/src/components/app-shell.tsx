"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { useGameStore } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LandingScreen() {
  const goToSetup = useGameStore((s) => s.goToSetup);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Landing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm text-center">
          Welcome to Playground HB Score
        </p>
        <Button onClick={goToSetup} className="w-full">
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
}

function SetupScreen() {
  const { goToScoring, addPlayer, players } = useGameStore((s) => ({
    goToScoring: s.goToScoring,
    addPlayer: s.addPlayer,
    players: s.players,
  }));

  function handleStartScoring() {
    // Auto-add a test player if none exist so transition guard passes
    if (players.length === 0) {
      addPlayer("Player 1");
    }
    // Small delay to allow state to settle after addPlayer
    setTimeout(() => {
      useGameStore.getState().goToScoring();
    }, 0);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Setup</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm text-center">
          Configure your game
        </p>
        <Button onClick={handleStartScoring} className="w-full">
          Start Scoring
        </Button>
      </CardContent>
    </Card>
  );
}

function ScoringScreen() {
  const { currentHole, nextHole, goToResults } = useGameStore((s) => ({
    currentHole: s.currentHole,
    nextHole: s.nextHole,
    goToResults: s.goToResults,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          Scoring - Hole {currentHole}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm text-center">
          Hole {currentHole} of 9
        </p>
        {currentHole < 9 ? (
          <Button onClick={nextHole} className="w-full">
            Next Hole
          </Button>
        ) : (
          <Button onClick={goToResults} className="w-full">
            View Results
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ResultsScreen() {
  const goToLanding = useGameStore((s) => s.goToLanding);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Results</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-sm text-center">
          Game complete!
        </p>
        <Button onClick={goToLanding} className="w-full">
          Play Again
        </Button>
      </CardContent>
    </Card>
  );
}

export function AppShell() {
  const phase = useGameStore((s) => s.phase);
  const hydrated = useGameStore((s) => s.hydrated);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    useGameStore.getState().hydrate();
  }, []);

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
              {phase === "scoring" && <ScoringScreen />}
              {phase === "results" && <ResultsScreen />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
