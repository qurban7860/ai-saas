"use client";

import { Moon, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-context";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground hover:bg-accent"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunMedium className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}