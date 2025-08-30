"use client";

import { useTheme } from "@/lib/theme";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon } from "lucide-react";

// Theme indicator component to show current theme status (light/dark only)
export function ThemeIndicator() {
  const { theme } = useTheme();

  const getThemeIcon = () => {
    return theme === 'light' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />;
  };

  const getThemeLabel = () => {
    return theme === 'light' ? 'Light' : 'Dark';
  };

  const getThemeColor = () => {
    return theme === 'light'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
      : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700';
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors duration-200 ${getThemeColor()}`}
    >
      {getThemeIcon()}
      <span>{getThemeLabel()}</span>
    </Badge>
  );
}
