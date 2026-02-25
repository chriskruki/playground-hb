/**
 * Theme Configuration — Single Source of Truth for Brand Colors
 *
 * This is the ONE file to edit to change app colors.
 * After editing, update the matching CSS custom properties in src/app/globals.css.
 *
 * Colors are defined here for:
 * - Documentation and discoverability
 * - Programmatic use in components that need color values (e.g., canvas, charts)
 * - Type-safe access to brand values
 */

export const themeColors = {
  background: "#FFF2D4", // warm yellow
  foreground: "oklch(0.145 0 0)",
  card: "oklch(1 0 0)", // white
  cardForeground: "oklch(0.145 0 0)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.145 0 0)",
  primary: "#34654A", // forest green
  primaryForeground: "oklch(0.98 0 0)",
  secondary: "#DCAF56", // golden yellow
  secondaryForeground: "oklch(0.1 0 0)",
  accent: "#DCAF56",
  accentForeground: "oklch(0.1 0 0)",
  muted: "oklch(0.97 0 0)",
  mutedForeground: "oklch(0.556 0 0)",
  destructive: "oklch(0.577 0.245 27.325)",
  border: "oklch(0.85 0.02 85)",
  input: "oklch(0.95 0.02 85)",
  ring: "#34654A",
  radius: "0.625rem",
} as const;

export type ThemeColors = typeof themeColors;
