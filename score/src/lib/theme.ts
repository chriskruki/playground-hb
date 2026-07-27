/**
 * Theme Configuration — Single Source of Truth for Brand Colors
 *
 * Derived from https://playgroundhb.com/ brand palette.
 * After editing, update the matching CSS custom properties in src/app/globals.css.
 */

export const themeColors = {
  background: "#fff8e8",       // pg-cream
  foreground: "#02210a",       // pg dark green-black
  card: "#ffffff",
  cardForeground: "#02210a",
  popover: "#ffffff",
  popoverForeground: "#02210a",
  primary: "#1f4f38",          // pg-green
  primaryForeground: "#fff8e8",
  secondary: "#e9b949",        // pg-mustard
  secondaryForeground: "#02210a",
  accent: "#e9b949",           // pg-mustard
  accentForeground: "#02210a",
  muted: "#f5f5f0",
  mutedForeground: "#666660",
  destructive: "#ec3c28",      // pg action red
  border: "#e6e6e0",
  input: "#f5f5f0",
  ring: "#1f4f38",             // pg-green
  scoreUnder: "#15803d",       // under par — vivid turf green
  scoreOver: "#dc2626",        // over par — clear red
  scoreEven: "#666660",        // even par — muted
  celebrate: "#e9b949",        // celebration accent (mustard)
  radius: "0.625rem",
  radiusPlayful: "1.25rem",
} as const;

export type ThemeColors = typeof themeColors;
