import { writable, derived, get } from 'svelte/store';
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

export const currentLocale = writable<string>(defaultLocale);

// Stores for different levels of translations
export const commonLocaleData = writable<LocaleData>({});
export const rootLocaleData = writable<MultiLocaleData>({});
export const routeLocaleData = writable<MultiLocaleData>({});

const routeCache = new Map<string, MultiLocaleData>();

function detectBrowserLanguage(): string {
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

async function fetchJson(path: string) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error(`Failed to fetch ${path}:`, e);
    return null;
  }
}

export async function loadCommonData(): Promise<void> {
  const data = await fetchJson('/data/lang/commons.json');
  if (data) commonLocaleData.set(data);
}

export async function loadRootData(): Promise<void> {
  const data = await fetchJson('/data/lang/routes/+lang.json');
  if (data) rootLocaleData.set(data);
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '';
  
  // Remove trailing slash
  let cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  // Remove leading slash for the fetch path construction
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

  // Handle dynamic routes if necessary, but here we just follow the literal path
  // Since our structure follows src/routes
  return cleanPath;
}

export async function loadRouteLocale(pathname: string): Promise<void> {
  const normalized = normalizePath(pathname);
  
  if (routeCache.has(normalized)) {
    routeLocaleData.set(routeCache.get(normalized)!);
    return;
  }

  const data = await fetchJson(`/data/lang/routes/${normalized}/+lang.json`);
  if (data) {
    routeCache.set(normalized, data);
    routeLocaleData.set(data);
  } else {
    routeLocaleData.set({});
  }
}

export async function initializeI18n(pathname: string = ''): Promise<void> {
  let initialLocale = defaultLocale;
  
  if (browser) {
    const storedLocale = localStorage.getItem('preferred-locale');
    if (storedLocale && availableLocales.find(l => l.code === storedLocale)) {
      initialLocale = storedLocale;
    } else {
      initialLocale = detectBrowserLanguage();
    }
  }
  
  currentLocale.set(initialLocale);
  
  await Promise.all([
    loadCommonData(),
    loadRootData(),
    loadRouteLocale(pathname)
  ]);
}

export async function setLocale(locale: string): Promise<void> {
  if (!availableLocales.find(l => l.code === locale)) {
    console.warn(`Locale ${locale} is not available`);
    return;
  }
  
  currentLocale.set(locale);
  
  if (browser) {
    localStorage.setItem('preferred-locale', locale);
  }
}

function getTranslation(
  key: string, 
  locale: string, 
  $routeData: MultiLocaleData, 
  $rootData: MultiLocaleData, 
  $commonData: LocaleData
): string | undefined {
  const safeLocale = locale.replace('-', '_');
  
  // 1. Check current route
  if ($routeData[safeLocale]?.[key] !== undefined) {
    return $routeData[safeLocale][key];
  }
  
  // 2. Check root (+lang.json in routes/)
  if ($rootData[safeLocale]?.[key] !== undefined) {
    return $rootData[safeLocale][key];
  }
  
  // 3. Check commons (monolingual usually, but we check key)
  if ($commonData[key] !== undefined) {
    return $commonData[key];
  }

  return undefined;
}

export const t = derived(
  [currentLocale, routeLocaleData, rootLocaleData, commonLocaleData],
  ([$currentLocale, $routeData, $rootData, $commonData]) => {
    return (key: string, fallback?: string, localeOverride?: string): string => {
      const locale = localeOverride || $currentLocale;
      const value = getTranslation(key, locale, $routeData, $rootData, $commonData);
      
      if (value !== undefined) return value;
      
      if (fallback !== undefined) return fallback;

      console.warn(`Translation key "${key}" not found in locale "${locale}"`);
      return key;
    };
  }
);

// Helper for non-reactive contexts
export async function tAsync(key: string, fallback?: string, localeOverride?: string): Promise<string> {
  const locale = localeOverride || get(currentLocale);
  const value = getTranslation(
    key, 
    locale, 
    get(routeLocaleData), 
    get(rootLocaleData), 
    get(commonLocaleData)
  );
  
  return value ?? fallback ?? key;
}

export const currentLocaleInfo = derived(
  currentLocale,
  ($currentLocale) => {
    return availableLocales.find(locale => locale.code === $currentLocale) || availableLocales[0];
  }
);
