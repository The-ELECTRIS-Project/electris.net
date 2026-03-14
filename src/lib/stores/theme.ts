import { browser } from '$app/environment';
import { writable } from 'svelte/store';

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

const storedTheme = browser ? (localStorage.getItem('theme') as Theme) : null;
const storedColorScheme = browser ? (localStorage.getItem('colorScheme') as ColorScheme) : null;
const initialTheme: Theme = storedTheme && availableThemes.includes(storedTheme) ? storedTheme : 'default';
const initialColorScheme: ColorScheme = storedColorScheme && availableColorSchemes.includes(storedColorScheme) ? storedColorScheme : 'auto';

export const theme = writable<Theme>(initialTheme);
export const colorScheme = writable<ColorScheme>(initialColorScheme);

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

export function setTheme(newTheme: Theme): void {
  theme.update(() => {
    if (browser) {
      localStorage.setItem('theme', newTheme);
      applyCurrentStyles();
    }
    return newTheme;
  });
}

export function setColorScheme(newColorScheme: ColorScheme): void {
  colorScheme.update(() => {
    if (browser) {
      localStorage.setItem('colorScheme', newColorScheme);
      applyCurrentStyles();
    }
    return newColorScheme;
  });
}

export function toggleColorScheme(): void {
  colorScheme.update(currentScheme => {
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
    
    if (browser) {
      localStorage.setItem('colorScheme', newScheme);
      applyCurrentStyles();
    }
    
    return newScheme;
  });
}

function applyCurrentStyles(): void {
  if (!browser) return;
  
  let currentTheme: Theme = 'default';
  let currentColorScheme: ColorScheme = 'auto';
  
  theme.subscribe(value => { currentTheme = value; })();
  colorScheme.subscribe(value => { currentColorScheme = value; })();
  
  applyStyles(currentTheme, currentColorScheme);
}

export function applyStyles(selectedTheme: Theme, selectedColorScheme: ColorScheme): void {
  if (!browser) return;
  
  const resolvedColorScheme = resolveColorScheme(selectedColorScheme);

  document.documentElement.setAttribute('data-theme', selectedTheme);
  document.documentElement.setAttribute('data-color-scheme', resolvedColorScheme);
  document.documentElement.setAttribute('data-color-scheme-selected', selectedColorScheme);
}

if (browser) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  mediaQuery.addEventListener('change', () => {
    colorScheme.update(currentScheme => {
      if (currentScheme === 'auto') {
        applyCurrentStyles();
      }
      return currentScheme;
    });
  });
  
  // Apply initial styles
  theme.subscribe(() => applyCurrentStyles());
  colorScheme.subscribe(() => applyCurrentStyles());
}