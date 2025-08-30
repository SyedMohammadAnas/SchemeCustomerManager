"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Simplified theme type - only light and dark
export type Theme = 'light' | 'dark';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props interface
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// Theme provider component
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'rafi-scheme-theme',
}: ThemeProviderProps) {
  // State for current theme
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Function to apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add new theme class
    root.classList.add(newTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newTheme === 'dark' ? '#0f0f23' : '#ffffff'
      );
    }
  };

  // Function to handle theme changes
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }

    // Apply theme
    applyTheme(newTheme);
  };

  // Function to toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    handleThemeChange(newTheme);
  };

  // Effect to initialize theme on mount
  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    const initialTheme = savedTheme || defaultTheme;

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [defaultTheme, storageKey]);

  // Context value
  const value: ThemeContextType = {
    theme,
    setTheme: handleThemeChange,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Utility function to get theme without hook (for SSR)
export function getThemeFromStorage(storageKey = 'rafi-scheme-theme'): Theme {
  if (typeof window === 'undefined') return 'light';

  const saved = localStorage.getItem(storageKey);
  return (saved as Theme) || 'light';
}
