import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeType = 'light' | 'dark' | 'pastel' | 'custom';

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface ThemeState {
  theme: ThemeType;
  customColors: CustomColors;
  setTheme: (theme: ThemeType) => void;
  setCustomColors: (colors: Partial<CustomColors>) => void;
}

export const defaultColors: Record<Exclude<ThemeType, 'custom'>, CustomColors> = {
  light: {
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
    accent: '#FFE66D',
    background: '#F7F9FC',
    text: '#2D3436',
  },
  dark: {
    primary: '#3B8B88',
    secondary: '#D64545',
    accent: '#C4B03B',
    background: '#1A1E20',
    text: '#F7F9FC',
  },
  pastel: {
    primary: '#A8E6CF',
    secondary: '#FFD3B6',
    accent: '#FFAAA5',
    background: '#FDFAF6',
    text: '#4A4A4A',
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      customColors: defaultColors.light,
      setTheme: (theme) => set((state) => {
        if (theme === 'custom') {
          return { theme };
        }
        return { theme, customColors: defaultColors[theme] };
      }),
      setCustomColors: (colors) => set((state) => ({
        theme: 'custom',
        customColors: { ...state.customColors, ...colors }
      }))
    }),
    {
      name: 'theme-storage',
    }
  )
);
