import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Token Types ────────────────────────────────────────────────────────────
export interface Theme {
  isDark: boolean;
  // Backgrounds
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceRaised: string;
  // Borders
  border: string;
  borderStrong: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textPlaceholder: string;
  // Accent (Indigo)
  accent: string;
  accentLight: string;
  accentSurface: string;
  accentBorder: string;
  // Semantic
  error: string;
  errorSurface: string;
  errorBorder: string;
  success: string;
  successSurface: string;
  warning: string;
  // Nav
  navBg: string;
  navBorder: string;
}

// ─── Dark Theme ──────────────────────────────────────────────────────────────
export const darkTheme: Theme = {
  isDark: true,
  bg: '#0d1117',
  bgSecondary: '#0f1422',
  surface: '#1a1f2e',
  surfaceRaised: '#202636',
  border: '#2a3040',
  borderStrong: '#3d4a60',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textPlaceholder: '#475569',
  accent: '#6366f1',
  accentLight: '#818cf8',
  accentSurface: 'rgba(99,102,241,0.12)',
  accentBorder: 'rgba(99,102,241,0.4)',
  error: '#f87171',
  errorSurface: 'rgba(239,68,68,0.08)',
  errorBorder: 'rgba(239,68,68,0.25)',
  success: '#34d399',
  successSurface: 'rgba(16,185,129,0.10)',
  warning: '#fbbf24',
  navBg: '#161b27',
  navBorder: '#2a3040',
};

// ─── Light Theme ─────────────────────────────────────────────────────────────
export const lightTheme: Theme = {
  isDark: false,
  bg: '#f8fafc',
  bgSecondary: '#f1f5f9',
  surface: '#ffffff',
  surfaceRaised: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textPlaceholder: '#94a3b8',
  accent: '#6366f1',
  accentLight: '#4f46e5',
  accentSurface: 'rgba(99,102,241,0.08)',
  accentBorder: 'rgba(99,102,241,0.3)',
  error: '#dc2626',
  errorSurface: 'rgba(220,38,38,0.06)',
  errorBorder: 'rgba(220,38,38,0.2)',
  success: '#16a34a',
  successSurface: 'rgba(22,163,74,0.08)',
  warning: '#d97706',
  navBg: '#ffffff',
  navBorder: '#e2e8f0',
};

// ─── Context ─────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

const STORAGE_KEY = '@fittrackbd_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val !== null) {
        setIsDark(val === 'dark');
      }
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
