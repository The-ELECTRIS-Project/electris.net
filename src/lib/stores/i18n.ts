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
const CACHE_PREFIX = 'electris-i18n-';

export const currentLocale = writable<string>(defaultLocale);

// Stores for different levels of translations
export const commonLocaleData = writable<LocaleData>({});
export const libLocaleData = writable<MultiLocaleData>({});
export const routeLocaleData = writable<MultiLocaleData>({});

const routeCache = new Map<string, MultiLocaleData>();
const libCache = new Set<string>();

// Manifest to track versions of each language file
let i18nManifest: Record<string, string> = {};

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

async function fetchWithCache(path: string) {
  if (!browser) return await fetchJson(path);

  // Normalize path to match manifest keys (e.g., /data/lang/commons.json -> commons.json)
  const manifestKey = path.startsWith('/data/lang/') ? path.replace('/data/lang/', '') : path;
  const expectedVersion = i18nManifest[manifestKey];

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

  const data = await fetchJson(path);
  if (data) {
    // If expectedVersion is missing from manifest, we still cache it but it might be refetched
    localStorage.setItem(cacheKey, JSON.stringify({ data, v: expectedVersion || '0' }));
  }
  return data;
}

async function loadManifest() {
  if (!browser) return;
  try {
    const data = await fetchJson('/data/lang/versions.json');
    if (data) {
      i18nManifest = data;
    }
  } catch (e) {
    console.error('Failed to load i18n manifest:', e);
  }
}

export async function loadCommonData(): Promise<void> {
  const data = await fetchWithCache('/data/lang/commons.json');
  if (data) commonLocaleData.set(data);
}

export async function loadLibLocale(libPath: string): Promise<void> {
  if (libCache.has(libPath)) return;

  const data = await fetchWithCache(`/data/lang/lib/${libPath}/+lang.json`);
  if (data) {
    libLocaleData.update(current => {
      const updated = { ...current };
      for (const locale in data) {
        if (locale === '__version') continue; // Skip version key
        const safeLocale = locale.replace('-', '_');
        updated[safeLocale] = { ...updated[safeLocale], ...data[locale] };
      }
      return updated;
    });
    libCache.add(libPath);
  }
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '';
  
  let cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

  return cleanPath;
}

export async function loadRouteLocale(pathname: string): Promise<void> {
  const normalized = normalizePath(pathname);
  
  if (routeCache.has(normalized)) {
    routeLocaleData.set(routeCache.get(normalized)!);
    return;
  }

  const fetchPath = normalized === '' 
    ? '/data/lang/routes/+lang.json' 
    : `/data/lang/routes/${normalized}/+lang.json`;

  const data = await fetchWithCache(fetchPath);
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
  
  if (browser) await loadManifest();
  
  await Promise.all([
    loadCommonData(),
    loadLibLocale('UI/NavBar'),
    loadLibLocale('Mobile/Popup'),
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
  $libData: MultiLocaleData,
  $commonData: LocaleData
): string | undefined {
  const safeLocale = locale.replace('-', '_');
  
  // 1. Check current route
  if ($routeData[safeLocale]?.[key] !== undefined) {
    return $routeData[safeLocale][key];
  }

  // 2. Check library components
  if ($libData[safeLocale]?.[key] !== undefined) {
    return $libData[safeLocale][key];
  }
  
  // 3. Check commons
  if ($commonData[key] !== undefined) {
    return $commonData[key];
  }

  return undefined;
}

export const t = derived(
  [currentLocale, routeLocaleData, libLocaleData, commonLocaleData],
  ([$currentLocale, $routeData, $libData, $commonData]) => {
    return (key: string, fallback?: string, localeOverride?: string): string => {
      const locale = localeOverride || $currentLocale;
      const value = getTranslation(key, locale, $routeData, $libData, $commonData);
      
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
    get(libLocaleData),
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
