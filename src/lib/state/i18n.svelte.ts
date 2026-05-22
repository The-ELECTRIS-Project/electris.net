import { browser } from '$app/environment';
import { modsState } from '$lib/state/mods.svelte';

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
  { code: 'ro-RO', name: 'Română', flag: '🇷🇴' }
];

const defaultLocale = 'en-US';

class I18nState {
  currentLocale = $state<string>(defaultLocale);
  commonLocaleData = $state<MultiLocaleData>({});
  libLocaleData = $state<MultiLocaleData>({});
  routeLocaleData = $state<MultiLocaleData>({});
  
  routeCache = new Set<string>();
  libCache = new Set<string>();

  constructor() {
    if (browser) {
      this.currentLocale = this.getInitialLocale();
      window.addEventListener('modsChanged', () => {
        const locale = modsState.config.site.locale;
        if (locale && locale !== this.currentLocale && availableLocales.find(l => l.code === locale)) {
          this.currentLocale = locale;
          void this.initializeI18n(window.location.pathname, locale);
        }
      });
    }
  }

  getInitialLocale(): string {
    const storedLocale = modsState.config.site.locale;
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

  async fetchJson(path: string): Promise<unknown | null> {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  normalizeLocaleData(data: unknown, locale: string): MultiLocaleData {
    const normalized: MultiLocaleData = {};
    if (!data || typeof data !== 'object' || Array.isArray(data)) return normalized;

    const safeLocale = locale.replace('-', '_');
    const localeData: LocaleData = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        localeData[key] = value;
      }
    }

    normalized[safeLocale] = localeData;
    return normalized;
  }

  mergeMultiLocaleData(base: MultiLocaleData, extra: MultiLocaleData): MultiLocaleData {
    const result = { ...base };
    for (const locale in extra) {
      result[locale] = { ...result[locale], ...extra[locale] };
    }
    return result;
  }

  async loadCommonData(locale: string = this.currentLocale) {
    const safeLocale = locale.replace('-', '_');
    const data = await this.fetchJson(`/data/lang/+commons.${safeLocale}.json`);
    if (data) {
      this.commonLocaleData = this.mergeMultiLocaleData(this.commonLocaleData, this.normalizeLocaleData(data, locale));
    }
  }

  async loadLibLocale(libPath: string, locale: string = this.currentLocale) {
    const safeLocale = locale.replace('-', '_');
    const cacheKey = `${libPath}|${safeLocale}`;
    if (this.libCache.has(cacheKey)) return;

    const data = await this.fetchJson(`/data/lang/lib/${libPath}/+lang.${safeLocale}.json`);
    if (data) {
      this.libLocaleData = this.mergeMultiLocaleData(this.libLocaleData, this.normalizeLocaleData(data, locale));
      this.libCache.add(cacheKey);
    }
  }

  normalizePath(pathname: string): string {
    if (!pathname || pathname === '/') return '';
    
    let cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

    return cleanPath;
  }

  async loadRouteLocale(pathname: string, locale: string = this.currentLocale) {
    const normalized = this.normalizePath(pathname);
    const safeLocale = locale.replace('-', '_');
    const cacheKey = `${normalized}|${safeLocale}`;
    
    if (this.routeCache.has(cacheKey)) return;

    let mergedRouteData: MultiLocaleData = {};

    // 1. Load hierarchy of +commons.json only
    const segments = normalized.split('/').filter(Boolean);
    const pathsToLoad = ['']; 
    let tempPath = '';
    for (const segment of segments) {
      tempPath += (tempPath ? '/' : '') + segment;
      pathsToLoad.push(tempPath);
    }

    for (const path of pathsToLoad) {
      const fetchPath = path === '' 
        ? `/data/lang/routes/+commons.${safeLocale}.json`
        : `/data/lang/routes/${path}/+commons.${safeLocale}.json`;
        
      const segmentCommon = await this.fetchJson(fetchPath);
      if (segmentCommon) {
        mergedRouteData = this.mergeMultiLocaleData(mergedRouteData, this.normalizeLocaleData(segmentCommon, locale));
      }
    }

    // 2. Load the specific +lang.json for the route
    const langPath = normalized === ''
      ? `/data/lang/routes/+lang.${safeLocale}.json`
      : `/data/lang/routes/${normalized}/+lang.${safeLocale}.json`;
      
    const specificLang = await this.fetchJson(langPath);
    if (specificLang) {
      mergedRouteData = this.mergeMultiLocaleData(mergedRouteData, this.normalizeLocaleData(specificLang, locale));
    }

    this.routeLocaleData = this.mergeMultiLocaleData(this.routeLocaleData, mergedRouteData);
    this.routeCache.add(cacheKey);
  }

  async initializeI18n(pathname: string = '', localeOverride?: string) {
    const locale = localeOverride || this.currentLocale;

    await Promise.all([
      this.loadCommonData(locale),
      this.loadLibLocale('components/layout/NavBar', locale),
      this.loadLibLocale('components/popups/Mobile', locale),
      this.loadLibLocale('components/popups/Cookies', locale),
      this.loadRouteLocale(pathname, locale)
    ]);
  }

  async setLocale(locale: string) {
    if (!availableLocales.find(l => l.code === locale)) {
      console.warn(`Locale ${locale} is not available`);
      return;
    }
    
    this.currentLocale = locale;
    
    if (browser) {
      modsState.updateSetting('site', 'locale', locale);
      await this.initializeI18n(window.location.pathname);
    }
  }

  getTranslation(key: string, locale: string): string | undefined {
    const safeLocale = locale.replace('-', '_');
    
    // 1. Check current route (hierarchical)
    if (this.routeLocaleData[safeLocale]?.[key] !== undefined) {
      return this.routeLocaleData[safeLocale][key];
    }

    // 2. Check library components
    if (this.libLocaleData[safeLocale]?.[key] !== undefined) {
      return this.libLocaleData[safeLocale][key];
    }
    
    // 3. Check global commons
    if (this.commonLocaleData[safeLocale]?.[key] !== undefined) {
      return this.commonLocaleData[safeLocale][key];
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

export const initializeI18n = (pathname: string = '') => i18nState.initializeI18n(pathname);
export const loadRouteLocale = (pathname: string) => i18nState.loadRouteLocale(pathname);
export const setLocale = (locale: string) => i18nState.setLocale(locale);
export { i18nState as i18n };
