import type { Transition, Variants } from "framer-motion";

/** Motion timing — subtle-everywhere (150–250ms), tuned in one place. */
export const DUR_FAST = 0.18;
export const DUR_MED = 0.25;
export const EASE_OUT = [0.16, 1, 0.3, 1] as const; // entering
export const EASE_IN = [0.4, 0, 1, 1] as const; // leaving

/** Tactile press for buttons/steppers. */
export const tap = { scale: 0.94 };
export const tapSoft = { scale: 0.97 };

/** Small pop for elements appearing in place. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

/** Springy pop for score numbers and celebratory bits. */
export const springPop: Transition = { type: "spring", stiffness: 520, damping: 24 };

/** Horizontal slide between holes; `dir` = 1 forward, -1 back. */
export const slideHorizontal: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -280 : 280, opacity: 0 }),
};

export const slideTransition: Transition = { duration: DUR_MED, ease: EASE_OUT };

/** Staggered list reveal. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR_MED, ease: EASE_OUT } },
};
