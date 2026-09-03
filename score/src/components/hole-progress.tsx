"use client";

import { useRef, useEffect } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACTIVE_OPACITY = 1;
const INACTIVE_OPACITY = 0.35;

export function HoleProgress({
  current,
  total,
  isLastHole,
  onPrev,
  onNext,
  onGoToHole,
  onEndGame,
}: {
  current: number;
  total: number;
  isLastHole: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToHole: (hole: number) => void;
  onEndGame: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startHole: number;
    stepPx: number;
    moved: boolean;
  } | null>(null);

  function measureStepPx(container: HTMLElement): number {
    const centers = Array.from(container.querySelectorAll<HTMLElement>("[data-hole]")).map(
      (el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      },
    );
    if (centers.length < 2) return 44;
    let sum = 0;
    for (let i = 1; i < centers.length; i++) sum += centers[i] - centers[i - 1];
    return sum / (centers.length - 1);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const container = scrollRef.current;
    if (!container) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startHole: current,
      stepPx: measureStepPx(container),
      moved: false,
    };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const delta = e.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(delta) < 6) return;
      drag.moved = true;
      scrollRef.current?.setPointerCapture(e.pointerId);
    }
    const steps = Math.round(-delta / drag.stepPx);
    const target = Math.min(total, Math.max(1, drag.startHole + steps));
    if (target !== current) onGoToHole(target);
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (drag.moved) scrollRef.current?.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const active = container.querySelector("[data-active='true']") as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [current]);

  return (
    <div className="flex w-full flex-col rounded-[var(--radius-playful)] bg-primary shadow-[var(--shadow-pop)]">
      <div className="flex h-16 w-full items-center px-1">
        <button
          onClick={onPrev}
          disabled={current <= 1}
          aria-label="Previous hole"
          className="flex size-11 shrink-0 items-center justify-center text-primary-foreground transition-opacity disabled:opacity-0"
        >
          <ChevronLeft className="size-6" strokeWidth={2.5} />
        </button>

        <div
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ touchAction: "pan-y" }}
          className="relative flex-1 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        >
          <div className="flex items-center justify-center gap-4">
            {Array.from({ length: total }, (_, i) => {
              const hole = i + 1;
              const isCurrent = hole === current;

              return (
                <button
                  key={hole}
                  data-hole={hole}
                  data-active={isCurrent}
                  onClick={() => onGoToHole(hole)}
                  aria-label={`Go to hole ${hole}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className="relative flex cursor-pointer flex-col items-center"
                >
                  <motion.span
                    animate={{ opacity: isCurrent ? ACTIVE_OPACITY : INACTIVE_OPACITY }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative"
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${hole}-${isCurrent}`}
                        initial={{ y: 4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -4, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className={`block font-extrabold tabular-nums leading-none text-primary-foreground ${
                          isCurrent ? "text-4xl" : "text-2xl text-primary-foreground/80"
                        }`}
                      >
                        {hole}
                      </motion.span>
                    </AnimatePresence>
                  </motion.span>

                  {isCurrent && (
                    <motion.div
                      layoutId="hole-indicator"
                      className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {!isLastHole ? (
          <button
            onClick={onNext}
            aria-label="Next hole"
            className="flex size-11 shrink-0 items-center justify-center text-primary-foreground"
          >
            <ChevronRight className="size-6" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="size-11 shrink-0" />
        )}
      </div>

      {isLastHole && (
        <button
          onClick={onEndGame}
          className="mx-3 mb-3 rounded-full bg-secondary py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90"
        >
          See Results
        </button>
      )}
    </div>
  );
}
