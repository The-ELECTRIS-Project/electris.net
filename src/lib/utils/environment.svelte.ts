import { browser } from '$app/environment';

export type Environment = 'production' | 'canary' | 'development' | 'unknown';

export interface EnvironmentInfo {
  environment: Environment;
  environmentSecondary: Environment;
  siteUrl: string;
  siteVersion: string;
  hostname: string;
  isProduction: boolean;
  isCanary: boolean;
  isDevelopment: boolean;
  isUnknown: boolean;
}

async function fetchSiteVersion(): Promise<string> {
  if (!browser) return '';
  
  try {
    const response = await fetch('/data/version/env.ver');
    if (!response.ok) {
      throw new Error(`Failed to fetch version: ${response.status}`);
    }
    const version = await response.text();
    return version.trim();
  } catch (error) {
    console.error('Error fetching site version:', error);
    return 'v0';
  }
}

class EnvironmentState {
  info = $state<EnvironmentInfo>({
    environment: 'unknown',
    environmentSecondary: 'unknown',
    siteUrl: '',
    siteVersion: '',
    hostname: '',
    isProduction: false,
    isCanary: false,
    isDevelopment: false,
    isUnknown: true
  });

  constructor() {
    if (browser) {
      this.refresh();
    }
  }

  async refresh() {
    try {
      const info = await this.detectEnvironment();
      this.info = info;
    } catch (error) {
      console.error('Failed to initialize environment state:', error);
    }
  }

  async detectEnvironment(): Promise<EnvironmentInfo> {
    let environment: Environment = 'unknown';
    let environmentSecondary: Environment = 'unknown';
    let hostname = '';
    let siteUrl = '';
    
    if (browser) {
      hostname = window.location.hostname;
      siteUrl = import.meta.env.VITE_SITE_URL || "";
      
      if (hostname === "canary.electris.net") {
        environment = "canary";
      } else if (hostname === "electris.net") {
        environment = "production";
      } else if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "testing.electris.net") {
        environment = "development";
      } else {
        environment = "unknown";
      }
    }

    const siteVersion = await fetchSiteVersion();

    return {
      environment,
      environmentSecondary,
      siteUrl,
      siteVersion,
      hostname,
      isProduction: environment === 'production',
      isCanary: environment === 'canary',
      isDevelopment: environment === 'development',
      isUnknown: environment === 'unknown'
    };
  }
}

export const environmentState = new EnvironmentState();

// Backward compatibility (optional)
export const environmentStore = {
  get info() { return environmentState.info; },
  refresh: () => environmentState.refresh(),
  subscribe: (fn: (v: EnvironmentInfo) => void) => {
    // For legacy store compatibility if needed
    return () => {};
  }
};

export function getCurrentEnvironment(): Environment {
  if (!browser) return 'unknown';

  const hostname = window.location.hostname;
  
  if (hostname === "canary.electris.net") {
    return "canary";
  } else if (hostname === "electris.net") {
    return "production";
  } else if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "testing.electris.net") {
    return "development";
  } else {
    return "unknown";
  }
}

export function generateEnvironmentUrl(path: string = '', search: string = ''): string {
  if (!browser) return '';
  
  const currentPath = path || window.location.pathname;
  const currentSearch = search || window.location.search;
  const env = getCurrentEnvironment();

  switch (env) {
    case "canary":
    case "development":
      return `https://electris.net${currentPath}${currentSearch}`;
    case "production":
      return `https://canary.electris.net${currentPath}${currentSearch}`;
    default:
      return `https://localhost:5173${currentPath}${currentSearch}`;
  }
}

export function getEnvironmentDisplayName(env?: Environment): string {
  const environment = env || getCurrentEnvironment();
  
  switch (environment) {
    case 'canary':
      return 'canary';
    case 'production':
      return 'production';
    case 'development':
      return 'development';
    default:
      return 'unknown';
  }
}
