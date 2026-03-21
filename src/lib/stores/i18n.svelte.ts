import { browser } from '$app/environment';

export interface LocaleData {
  [key: string]: string;
}

export interface MultiLocaleData {
  [locale: string]: LocaleData;
}

export interface AvailableLocale {
  code: string;
  name: string;
  flag: string;
}

export const availableLocales: AvailableLocale[] = [
  { code: 'ar', name: 'اللغة العربية', flag: '🇪🇬'},
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵'},
  { code: 'ro-RO', name: 'Română', flag: '🇷🇴' }
];

const defaultLocale = 'en-US';
const CACHE_PREFIX = 'electris-i18n-';

class I18nState {
  currentLocale = $state<string>(defaultLocale);
  commonLocaleData = $state<LocaleData>({});
  libLocaleData = $state<MultiLocaleData>({});
  routeLocaleData = $state<MultiLocaleData>({});
  
  routeCache = new Map<string, MultiLocaleData>();
  libCache = new Set<string>();
  i18nManifest: Record<string, string> = {};

  constructor() {
    if (browser) {
      this.currentLocale = this.getInitialLocale();
    }
  }

  getInitialLocale(): string {
    const storedLocale = localStorage.getItem('preferred-locale');
    if (storedLocale && availableLocales.find(l => l.code === storedLocale)) {
      return storedLocale;
    }
    return this.detectBrowserLanguage();
  }

  detectBrowserLanguage(): string {
    if (!browser) return defaultLocale;
    
    const browserLang = navigator.language;
    const availableCodes = availableLocales.map(locale => locale.code);
    
    if (availableCodes.includes(browserLang)) {
      return browserLang;
    }
    
    const langFamily = browserLang.split('-')[0];
    const familyMatch = availableCodes.find(code => code.startsWith(langFamily));
    
    return familyMatch || defaultLocale;
  }

  async fetchJson(path: string) {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error(`Failed to fetch ${path}:`, e);
      return null;
    }
  }

  async fetchWithCache(path: string) {
    if (!browser) return await this.fetchJson(path);

    const manifestKey = path.startsWith('/data/lang/') ? path.replace('/data/lang/', '') : path;
    const expectedVersion = this.i18nManifest[manifestKey];

    const cacheKey = `${CACHE_PREFIX}${path}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached && expectedVersion) {
      try {
        const { data, v } = JSON.parse(cached);
        if (v === expectedVersion) return data;
      } catch (e) {
        // Ignore parse errors
      }
    }

    const data = await this.fetchJson(path);
    if (data) {
      localStorage.setItem(cacheKey, JSON.stringify({ data, v: expectedVersion || '0' }));
    }
    return data;
  }

  async loadManifest() {
    if (!browser) return;
    try {
      const data = await this.fetchJson('/data/lang/versions.json');
      if (data) {
        this.i18nManifest = data;
      }
    } catch (e) {
      console.error('Failed to load i18n manifest:', e);
    }
  }

  async loadCommonData() {
    const data = await this.fetchWithCache('/data/lang/commons.json');
    if (data) this.commonLocaleData = data;
  }

  async loadLibLocale(libPath: string) {
    if (this.libCache.has(libPath)) return;

    const data = await this.fetchWithCache(`/data/lang/lib/${libPath}/+lang.json`);
    if (data) {
      const updated = { ...this.libLocaleData };
      for (const locale in data) {
        if (locale === '__version') continue;
        const safeLocale = locale.replace('-', '_');
        updated[safeLocale] = { ...updated[safeLocale], ...data[locale] };
      }
      this.libLocaleData = updated;
      this.libCache.add(libPath);
    }
  }

  normalizePath(pathname: string): string {
    if (!pathname || pathname === '/') return '';
    
    let cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

    return cleanPath;
  }

  async loadRouteLocale(pathname: string) {
    const normalized = this.normalizePath(pathname);
    
    if (this.routeCache.has(normalized)) {
      this.routeLocaleData = this.routeCache.get(normalized)!;
      return;
    }

    const fetchPath = normalized === '' 
      ? '/data/lang/routes/+lang.json' 
      : `/data/lang/routes/${normalized}/+lang.json`;

    const data = await this.fetchWithCache(fetchPath);
    if (data) {
      this.routeCache.set(normalized, data);
      this.routeLocaleData = data;
    } else {
      this.routeLocaleData = {};
    }
  }

  async initializeI18n(pathname: string = '') {
    if (browser) await this.loadManifest();
    
    await Promise.all([
      this.loadCommonData(),
      this.loadLibLocale('UI/NavBar'),
      this.loadLibLocale('Mobile/Popup'),
      this.loadRouteLocale(pathname)
    ]);
  }

  async setLocale(locale: string) {
    if (!availableLocales.find(l => l.code === locale)) {
      console.warn(`Locale ${locale} is not available`);
      return;
    }
    
    this.currentLocale = locale;
    
    if (browser) {
      localStorage.setItem('preferred-locale', locale);
    }
  }

  getTranslation(key: string, locale: string): string | undefined {
    const safeLocale = locale.replace('-', '_');
    
    // 1. Check current route
    if (this.routeLocaleData[safeLocale]?.[key] !== undefined) {
      return this.routeLocaleData[safeLocale][key];
    }

    // 2. Check library components
    if (this.libLocaleData[safeLocale]?.[key] !== undefined) {
      return this.libLocaleData[safeLocale][key];
    }
    
    // 3. Check commons
    if (this.commonLocaleData[key] !== undefined) {
      return this.commonLocaleData[key];
    }

    return undefined;
  }

  translate(key: string, fallback?: string, localeOverride?: string): string {
    const locale = localeOverride || this.currentLocale;
    const value = this.getTranslation(key, locale);
    
    if (value !== undefined) return value;
    
    if (fallback !== undefined) return fallback;

    console.warn(`Translation key "${key}" not found in locale "${locale}"`);
    return key;
  }

  get currentLocaleInfo() {
    return availableLocales.find(locale => locale.code === this.currentLocale) || availableLocales[0];
  }
}

export const i18nState = new I18nState();

// Compatibility layer
export const t = (key: string, fallback?: string, localeOverride?: string): string => {
  return i18nState.translate(key, fallback, localeOverride);
};

export const translate = t;

// And a getter for t that works in Svelte 5 components
export const tStore = {
  get current() {
    return (key: string, fallback?: string, localeOverride?: string) => 
      i18nState.translate(key, fallback, localeOverride);
  }
};

// To maintain $t syntax in components without renaming everything,
// we can use a proxy or just export the state.

export const initializeI18n = (pathname: string = '') => i18nState.initializeI18n(pathname);
export const loadRouteLocale = (pathname: string) => i18nState.loadRouteLocale(pathname);
export const setLocale = (locale: string) => i18nState.setLocale(locale);

// Legacy exports for now
export { i18nState as i18n };
