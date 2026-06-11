import type { ThemeMode } from '@ai-company-assistant/shared';
import { create } from 'zustand';

const THEME_STORAGE_KEY = 'ai-company-assistant.theme';

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
}

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getInitialTheme(),
  toggleMode: () => {
    const mode = get().mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    set({ mode });
  }
}));
