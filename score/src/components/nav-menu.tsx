"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Menu, RotateCcw, Users, X } from "lucide-react";

interface NavMenuProps {
  onNewGame: () => void;
  onEditPlayers: () => void;
}

export function NavMenu({ onNewGame, onEditPlayers }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
      >
        {open ? <X className="size-5" strokeWidth={2.5} /> : <Menu className="size-5" strokeWidth={2.5} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="card-playful absolute left-0 top-11 z-50 flex w-48 origin-top-left flex-col overflow-hidden border border-border bg-card p-1.5 shadow-[var(--shadow-pop)]"
          >
            <button
              onClick={() => run(onNewGame)}
              className="flex items-center gap-2.5 rounded-[calc(var(--radius-playful)-0.35rem)] px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
            >
              <RotateCcw className="size-4 text-primary" strokeWidth={2.5} />
              New Game
            </button>
            <button
              onClick={() => run(onEditPlayers)}
              className="flex items-center gap-2.5 rounded-[calc(var(--radius-playful)-0.35rem)] px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
            >
              <Users className="size-4 text-primary" strokeWidth={2.5} />
              Edit Players
            </button>
            <a
              href="https://playgroundhb.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-[calc(var(--radius-playful)-0.35rem)] px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
            >
              <ExternalLink className="size-4 text-primary" strokeWidth={2.5} />
              Learn More
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
