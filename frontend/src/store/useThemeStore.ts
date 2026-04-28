import { create } from 'zustand'

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  gray: string;
  lightGray: string;
}

interface ThemeState {
  colors: ThemeColors;
  setPrimary: (color: string) => void;
  setSecondary: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  colors: {
    primary: '#FFFFFF',
    secondary: '#22C55E', // Lighter Green
    accent: '#4ADE80',    // Lighter Emerald
    dark: '#0F172A',      // Slate 900
    gray: '#64748B',      // Slate 500
    lightGray: '#F8FAFC'  // Slate 50
  },
  
  setPrimary: (color) => set((state) => ({ colors: { ...state.colors, primary: color } })),
  setSecondary: (color) => set((state) => ({ colors: { ...state.colors, secondary: color } })),
}))
