"use client";

import { motion } from "framer-motion";
import { Flag } from "lucide-react";
import { Logo } from "@/components/logo";
import { useGameStore } from "@/lib/game-store";
import { DUR_MED, EASE_OUT, springPop, tapSoft } from "@/lib/motion";

export function LandingScreen() {
  const goToSetup = useGameStore((s) => s.goToSetup);

  return (
    <motion.div
      className="flex flex-col items-center gap-8 py-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR_MED, ease: EASE_OUT }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...springPop, delay: 0.05 }}
      >
        <Logo className="h-20" />
      </motion.div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Playground HB</h1>
        <p className="flex items-center gap-1.5 text-lg font-medium text-muted-foreground">
          <Flag className="size-4" strokeWidth={2.5} />
          Mini Golf Scorecard
        </p>
      </div>

      <motion.button
        onClick={goToSetup}
        whileTap={tapSoft}
        className="w-full rounded-[var(--radius-playful)] bg-primary py-5 text-xl font-extrabold text-primary-foreground shadow-[var(--shadow-pop)] transition-colors hover:bg-primary/90"
      >
        Start Game
      </motion.button>
    </motion.div>
  );
}
