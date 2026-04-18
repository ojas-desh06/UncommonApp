"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-8" />;

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}
