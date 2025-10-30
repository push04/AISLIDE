export type Theme = 'light' | 'dark';

export const themes = {
  light: {
    primary: '255 99 132',
    primaryForeground: '255 255 255',
    secondary: '99 102 241',
    secondaryForeground: '255 255 255',
    accent: '236 72 153',
    accentForeground: '255 255 255',
    background: '248 250 252',
    foreground: '15 23 42',
    card: '255 255 255',
    cardForeground: '15 23 42',
    muted: '241 245 249',
    mutedForeground: '100 116 139',
    border: '226 232 240',
    input: '226 232 240',
    ring: '99 102 241',
    success: '34 197 94',
    warning: '251 146 60',
    error: '239 68 68',
  },
  dark: {
    primary: '255 99 132',
    primaryForeground: '255 255 255',
    secondary: '129 140 248',
    secondaryForeground: '255 255 255',
    accent: '244 114 182',
    accentForeground: '255 255 255',
    background: '10 10 15',
    foreground: '241 245 249',
    card: '15 20 30',
    cardForeground: '241 245 249',
    muted: '30 41 59',
    mutedForeground: '148 163 184',
    border: '51 65 85',
    input: '51 65 85',
    ring: '129 140 248',
    success: '74 222 128',
    warning: '251 191 36',
    error: '248 113 113',
  },
};

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const colors = themes[theme];

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  root.setAttribute('data-theme', theme);
}
