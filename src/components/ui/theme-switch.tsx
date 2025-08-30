"use client";

import { useTheme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

// Simple theme switch component - clean toggle between light and dark
export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle handle */}
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
        }`}
      />

      {/* Icons */}
      <Sun className="absolute left-1 h-3 w-3 text-yellow-500 transition-opacity duration-200" />
      <Moon className="absolute right-1 h-3 w-3 text-slate-400 transition-opacity duration-200" />
    </button>
  );
}

// Alternative theme switch with labels
export function ThemeSwitchWithLabels() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium transition-colors duration-200 ${
        theme === 'light' ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        Light
      </span>

      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label="Toggle theme"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      <span className={`text-sm font-medium transition-colors duration-200 ${
        theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        Dark
      </span>
    </div>
  );
}
