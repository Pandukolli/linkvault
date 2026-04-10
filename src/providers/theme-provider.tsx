"use client";

/**
 * Theme provider — Currently bypassing multi-theme logic to enforce the 
 * premium "Cream & Obsidian Minimalist" aesthetic permanently.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
