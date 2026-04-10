/**
 * Simplified Theme System — Light / Dark / System
 * No more palettes, accent colors, or background customization.
 */

export type ThemeMode = "light" | "dark" | "system";

export function applyThemeVariables(theme: string) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Clean up any old inline styles from the previous palette system
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-glow");
  root.style.removeProperty("--ring");
  root.style.removeProperty("--sidebar");
  root.style.removeProperty("--card");
  root.style.removeProperty("--border");
  root.style.removeProperty("--card-border");
  root.style.removeProperty("--background");

  // Theme is now managed by next-themes class toggle
  // No more inline style overrides needed
}

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
