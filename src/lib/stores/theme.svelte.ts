import { browser } from '$app/environment';

export type Theme = 'default' | 'cyber-neotic';
export type ColorScheme = 'light' | 'dark' | 'midnight' | 'auto';

export const availableThemes: readonly Theme[] = [
  'default',
  'cyber-neotic'
] as const;

export const availableColorSchemes: readonly ColorScheme[] = [
  'light',
  'dark',
  'midnight',
  'auto'
] as const;

function getSystemPreference(): 'light' | 'dark' {
  if (!browser) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveColorScheme(selectedColorScheme: ColorScheme): 'light' | 'dark' | 'midnight' {
  if (selectedColorScheme === 'auto') {
    return getSystemPreference();
  }
  return selectedColorScheme;
}

const storedTheme = browser ? (localStorage.getItem('theme') as Theme) : null;
const storedColorScheme = browser ? (localStorage.getItem('colorScheme') as ColorScheme) : null;

const initialTheme: Theme = storedTheme && availableThemes.includes(storedTheme) ? storedTheme : 'default';
const initialColorScheme: ColorScheme = storedColorScheme && availableColorSchemes.includes(storedColorScheme) ? storedColorScheme : 'auto';

// Use a class or a simple object with $state for runes
class ThemeState {
  theme = $state<Theme>(initialTheme);
  colorScheme = $state<ColorScheme>(initialColorScheme);

  constructor() {
    if (browser) {
      this.applyCurrentStyles();
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.colorScheme === 'auto') {
          this.applyCurrentStyles();
        }
      });
    }
  }

  setTheme(newTheme: Theme) {
    this.theme = newTheme;
    if (browser) {
      localStorage.setItem('theme', newTheme);
      this.applyCurrentStyles();
    }
  }

  setColorScheme(newColorScheme: ColorScheme) {
    this.colorScheme = newColorScheme;
    if (browser) {
      localStorage.setItem('colorScheme', newColorScheme);
      this.applyCurrentStyles();
    }
  }

  toggleColorScheme() {
    const newScheme = this.colorScheme === 'dark' ? 'light' : 'dark';
    this.setColorScheme(newScheme);
  }

  applyCurrentStyles() {
    if (!browser) return;
    applyStyles(this.theme, this.colorScheme);
  }
}

export const themeState = new ThemeState();

export function setTheme(newTheme: Theme): void {
  themeState.setTheme(newTheme);
}

export function setColorScheme(newColorScheme: ColorScheme): void {
  themeState.setColorScheme(newColorScheme);
}

export function toggleColorScheme(): void {
  themeState.toggleColorScheme();
}

export function applyStyles(selectedTheme: Theme, selectedColorScheme: ColorScheme): void {
  if (!browser) return;
  
  const resolvedColorScheme = resolveColorScheme(selectedColorScheme);

  document.documentElement.setAttribute('data-theme', selectedTheme);
  document.documentElement.setAttribute('data-color-scheme', resolvedColorScheme);
  document.documentElement.setAttribute('data-color-scheme-selected', selectedColorScheme);
}
