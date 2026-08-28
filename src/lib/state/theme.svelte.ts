import { browser } from '$app/environment';
import {
  availableColorSchemes,
  availableThemes,
  modsState,
  type ColorScheme,
  type Theme
} from '$lib/state/mods.svelte';

export {
  availableColorSchemes,
  availableThemes,
  type ColorScheme,
  type Theme
} from '$lib/state/mods.svelte';

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

class ThemeState {
  theme = $state<Theme>(modsState.config.site.theme);
  colorScheme = $state<ColorScheme>(modsState.config.site.colorScheme);
  resolvedColorScheme = $derived(resolveColorScheme(this.colorScheme));

  constructor() {
    if (browser) {
      this.applyCurrentStyles();

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.colorScheme === 'auto') {
          this.applyCurrentStyles();
        }
      });

      window.addEventListener('modsChanged', () => {
        this.syncFromMods();
      });
    }
  }

  setTheme(newTheme: Theme) {
    if (!availableThemes.includes(newTheme)) return;

    this.theme = newTheme;
    if (browser) {
      modsState.updateSetting('site', 'theme', newTheme);
      this.applyCurrentStyles();
    }
  }

  setColorScheme(newColorScheme: ColorScheme) {
    if (!availableColorSchemes.includes(newColorScheme)) return;

    this.colorScheme = newColorScheme;
    if (browser) {
      modsState.updateSetting('site', 'colorScheme', newColorScheme);
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

  private syncFromMods() {
    const { theme, colorScheme } = modsState.config.site;
    let changed = false;

    if (theme !== this.theme) {
      this.theme = theme;
      changed = true;
    }

    if (colorScheme !== this.colorScheme) {
      this.colorScheme = colorScheme;
      changed = true;
    }

    if (changed) {
      this.applyCurrentStyles();
    }
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
  document.documentElement.setAttribute('data-hide-scrollbar', modsState.config.site.hideScrollbar.toString());
}
