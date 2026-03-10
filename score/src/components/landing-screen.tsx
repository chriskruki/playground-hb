"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { useGameStore } from "@/lib/game-store";
import { Button } from "@/components/ui/button";

export function LandingScreen() {
  const goToSetup = useGameStore((s) => s.goToSetup);

  return (
    <motion.div
      className="flex flex-col items-center gap-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Logo className="h-16" />

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-bold text-primary">Playground HB</h1>
        <p className="text-lg text-muted-foreground">Mini Golf Scorecard</p>
      </div>

      <Button size="lg" className="w-full text-lg" onClick={goToSetup}>
        Start Game
      </Button>
    </motion.div>
  );
}
