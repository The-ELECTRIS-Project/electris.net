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

export interface SiteModsConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  locale: string | null;
  cookieDisclosureDismissed: boolean;
  mobilePopupDismissed: boolean;
  hideScrollbar: boolean;
  enableOrbit: boolean;
  textWrapSpacing: number;
  adaptiveOrbitColor: boolean;
}

export interface NewHomeModsConfig {
  gridCols: number;
  gridRows: number;
  openLinksInNewTabs: boolean;
  showQuickPins: boolean;
  showSearchBar: boolean;
}

export interface DevToolsModsConfig {
  ignoreExcludedSuffixes: boolean;
}

export interface ModsConfig {
  site: SiteModsConfig;
  newHome: NewHomeModsConfig;
  devTools: DevToolsModsConfig;
}

type ModsSettingKey = keyof SiteModsConfig | keyof NewHomeModsConfig | keyof DevToolsModsConfig;
type ModsSettingValue =
  | SiteModsConfig[keyof SiteModsConfig]
  | NewHomeModsConfig[keyof NewHomeModsConfig]
  | DevToolsModsConfig[keyof DevToolsModsConfig];

const MODS_STORAGE_KEY = 'electris-mods';

const DEFAULT_SITE_MODS: SiteModsConfig = {
  theme: 'default',
  colorScheme: 'auto',
  locale: null,
  cookieDisclosureDismissed: false,
  mobilePopupDismissed: false,
  hideScrollbar: false,
  enableOrbit: true,
  textWrapSpacing: 0.69,
  adaptiveOrbitColor: true
};

const DEFAULT_NEW_HOME_MODS: NewHomeModsConfig = {
  gridCols: 5,
  gridRows: 2,
  openLinksInNewTabs: false,
  showQuickPins: true,
  showSearchBar: true
};

const DEFAULT_DEVTOOLS_MODS: DevToolsModsConfig = {
  ignoreExcludedSuffixes: false
};

function createDefaultMods(): ModsConfig {
  return {
    site: { ...DEFAULT_SITE_MODS },
    newHome: { ...DEFAULT_NEW_HOME_MODS },
    devTools: { ...DEFAULT_DEVTOOLS_MODS }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && availableThemes.includes(value as Theme);
}

function isColorScheme(value: unknown): value is ColorScheme {
  return typeof value === 'string' && availableColorSchemes.includes(value as ColorScheme);
}

function readNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function readFloat(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function readJson(value: string | null): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse mods config:', error);
    return null;
  }
}

function applySiteMods(config: SiteModsConfig, source: unknown) {
  if (!isRecord(source)) return;

  if (isTheme(source.theme)) {
    config.theme = source.theme;
  }

  if (isColorScheme(source.colorScheme)) {
    config.colorScheme = source.colorScheme;
  }

  if (typeof source.locale === 'string' || source.locale === null) {
    config.locale = source.locale;
  }

  config.cookieDisclosureDismissed = readBoolean(source.cookieDisclosureDismissed, config.cookieDisclosureDismissed);
  config.mobilePopupDismissed = readBoolean(source.mobilePopupDismissed, config.mobilePopupDismissed);
  config.hideScrollbar = readBoolean(source.hideScrollbar, config.hideScrollbar);
  if (source.enableOrbit !== undefined) {
    config.enableOrbit = readBoolean(source.enableOrbit, config.enableOrbit);
  } else if (source.disableOrbit !== undefined) {
    config.enableOrbit = !readBoolean(source.disableOrbit, false);
  } else {
    config.enableOrbit = readBoolean(source.enableOrbit, config.enableOrbit);
  }
  config.textWrapSpacing = readFloat(source.textWrapSpacing, config.textWrapSpacing, 0.1, 1);
  config.adaptiveOrbitColor = readBoolean(source.adaptiveOrbitColor, config.adaptiveOrbitColor);
}

function applyNewHomeMods(config: NewHomeModsConfig, source: unknown) {
  if (!isRecord(source)) return;

  config.gridCols = readNumber(source.gridCols, config.gridCols, 2, 8);
  config.gridRows = readNumber(source.gridRows, config.gridRows, 1, 3);
  config.openLinksInNewTabs = readBoolean(source.openLinksInNewTabs, config.openLinksInNewTabs);
  config.showQuickPins = readBoolean(source.showQuickPins, config.showQuickPins);
  config.showSearchBar = readBoolean(source.showSearchBar, config.showSearchBar);
}

function applyDevToolsMods(config: DevToolsModsConfig, source: unknown) {
  if (!isRecord(source)) return;

  config.ignoreExcludedSuffixes = readBoolean(source.ignoreExcludedSuffixes, config.ignoreExcludedSuffixes);
}

function applyModsConfig(config: ModsConfig, source: unknown) {
  if (!isRecord(source)) return;

  applySiteMods(config.site, source.site);
  applyNewHomeMods(config.newHome, source.newHome);
  applyDevToolsMods(config.devTools, source.devTools);
}

function hasLegacyCookie(name: string) {
  if (!browser) return false;
  return document.cookie.includes(`${name}=true`);
}

function expireLegacyCookie(name: string) {
  if (!browser) return;

  const domains = [
    window.location.hostname,
    `.${window.location.hostname}`,
    'electris.net',
    '.electris.net',
    'localhost'
  ];

  domains.forEach((domain) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

class ModsState {
  config = $state<ModsConfig>(createDefaultMods());

  constructor() {
    if (browser) {
      this.init();
    }
  }

  init() {
    if (!browser) return;

    const config = createDefaultMods();
    const savedMods = readJson(localStorage.getItem(MODS_STORAGE_KEY));

    if (savedMods) {
      applyModsConfig(config, savedMods);
    } else {
      this.applyLegacyMods(config);
    }

    this.config = config;
    this.saveMods();
  }

  updateSetting(
    sectionOrKey: keyof ModsConfig | keyof NewHomeModsConfig,
    keyOrValue: ModsSettingKey | ModsSettingValue,
    value?: ModsSettingValue
  ) {
    if (value === undefined) {
      const key = sectionOrKey as keyof NewHomeModsConfig;
      this.config.newHome[key] = keyOrValue as never;
      this.saveMods('newHome');
      return;
    }

    const section = sectionOrKey as keyof ModsConfig;
    const sectionConfig = this.config[section] as unknown as Record<string, unknown>;
    sectionConfig[keyOrValue as string] = value;
    this.saveMods(section);
  }

  updateSettings(updates: Partial<NewHomeModsConfig>) {
    this.updateSection('newHome', updates);
  }

  updateSection<Section extends keyof ModsConfig>(
    section: Section,
    updates: Partial<ModsConfig[Section]>
  ) {
    Object.assign(this.config[section], updates);
    this.saveMods(section);
  }

  resetSection<Section extends keyof ModsConfig>(section: Section) {
    const defaults = createDefaultMods();
    this.config[section] = defaults[section];
    this.saveMods(section);
  }

  private applyLegacyMods(config: ModsConfig) {
    const savedTheme = localStorage.getItem('theme');
    const savedColorScheme = localStorage.getItem('colorScheme');
    const savedLocale = localStorage.getItem('preferred-locale');
    const savedNewHomeMods = readJson(localStorage.getItem('newhome-mods'));
    const savedCols = localStorage.getItem('newhome-grid-cols');
    const savedRows = localStorage.getItem('newhome-grid-rows');

    if (isTheme(savedTheme)) {
      config.site.theme = savedTheme;
    }

    if (isColorScheme(savedColorScheme)) {
      config.site.colorScheme = savedColorScheme;
    }

    if (savedLocale) {
      config.site.locale = savedLocale;
    }

    config.site.cookieDisclosureDismissed =
      localStorage.getItem('cookieDisclosureDismissed') === 'true' ||
      hasLegacyCookie('cookieDisclosureDismissed');
    config.site.mobilePopupDismissed = hasLegacyCookie('mobilePopupDismissed');

    if (savedNewHomeMods) {
      applyNewHomeMods(config.newHome, savedNewHomeMods);
    } else {
      config.newHome.gridCols = readNumber(savedCols, config.newHome.gridCols, 2, 8);
      config.newHome.gridRows = readNumber(savedRows, config.newHome.gridRows, 1, 3);
    }

    config.devTools.ignoreExcludedSuffixes = hasLegacyCookie('devtools-ignore-excluded-suffixes');
    expireLegacyCookie('cookieDisclosureDismissed');
    expireLegacyCookie('mobilePopupDismissed');
    expireLegacyCookie('devtools-ignore-excluded-suffixes');
  }

  private saveMods(section?: keyof ModsConfig) {
    if (!browser) return;

    try {
      localStorage.setItem(MODS_STORAGE_KEY, JSON.stringify(this.config));
      window.dispatchEvent(new CustomEvent('modsChanged', {
        detail: this.config
      }));
      window.dispatchEvent(new CustomEvent('mods:changed', {
        detail: {
          config: this.config,
          section
        }
      }));
    } catch (error) {
      console.warn('Failed to save mods config:', error);
    }
  }
}

export const modsState = new ModsState();

export const mods = {
  get config() { return modsState.config; },
  updateSetting: modsState.updateSetting.bind(modsState),
  updateSettings: modsState.updateSettings.bind(modsState),
  updateSection: modsState.updateSection.bind(modsState),
  resetSection: modsState.resetSection.bind(modsState),
  init: () => modsState.init()
};
