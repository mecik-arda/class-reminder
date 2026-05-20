export type ColorPalette = {
  primary: string;
  secondary: string;
  tertiary: string;
};

export type TextColors = {
  primary: string;
  secondary: string;
  tertiary: string;
};

export type PurpleShades = {
  light: string;
  medium: string;
  dark: string;
  accent: string;
};

export type AppTheme = {
  isDark: boolean;
  background: ColorPalette;
  card: {
    background: string;
    border: string;
  };
  text: TextColors;
  purple: PurpleShades;
  glow: boolean;
};

export type LanguageCode = 'tr' | 'en';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface ClassSession {
  id: string;
  courseName: string;
  teacher?: string;
  classroom?: string;
  day: number; // 0-6 (0 = Monday, 6 = Sunday)
  startTime: string; // "09:00" format
  endTime: string; // "10:30" format
  notes?: string;
  absences?: number; // Number of absences recorded
  absenceLimit?: number; // Max absences allowed before failing
}
