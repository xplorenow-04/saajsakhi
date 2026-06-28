import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useThemeStore = create(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      }),
      { name: 'theme-store' }
    ),
    { name: 'ThemeStore' }
  )
);
