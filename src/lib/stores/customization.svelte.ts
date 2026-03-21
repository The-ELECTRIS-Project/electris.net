import { browser } from '$app/environment';

export interface ModsConfig {
  gridCols: number;
  gridRows: number;
  openLinksInNewTabs: boolean;
  showQuickPins: boolean;
  showSearchBar: boolean;
}

const DEFAULT_MODS: ModsConfig = {
  gridCols: 5,
  gridRows: 2,
  openLinksInNewTabs: false,
  showQuickPins: true,
  showSearchBar: true
};

class ModsState {
  config = $state<ModsConfig>({ ...DEFAULT_MODS });

  constructor() {
    if (browser) {
      this.init();
    }
  }

  init() {
    const config: ModsConfig = { ...DEFAULT_MODS };
    const savedMods = localStorage.getItem('newhome-mods');
    
    if (savedMods) {
      try {
        const parsed = JSON.parse(savedMods);
        Object.assign(config, parsed);
      } catch (e) {
        console.warn('Failed to parse mods config:', e);
      }
    } else {
      const savedCols = localStorage.getItem('newhome-grid-cols');
      const savedRows = localStorage.getItem('newhome-grid-rows');
      
      if (savedCols) config.gridCols = parseInt(savedCols);
      if (savedRows) config.gridRows = parseInt(savedRows);
      
      this.saveMods(config);
    }
    
    this.config = config;
  }

  updateSetting<K extends keyof ModsConfig>(key: K, value: ModsConfig[K]) {
    this.config[key] = value;
    this.saveMods(this.config);
  }

  updateSettings(updates: Partial<ModsConfig>) {
    Object.assign(this.config, updates);
    this.saveMods(this.config);
  }

  private saveMods(config: ModsConfig) {
    if (!browser) return;
    try {
      localStorage.setItem('newhome-mods', JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('modsChanged', {
        detail: config
      }));
    } catch (e) {
      console.warn('Failed to save mods config:', e);
    }
  }
}

export const modsState = new ModsState();

// Backward compatibility (optional)
export const mods = {
  get config() { return modsState.config; },
  updateSetting: (key: any, value: any) => modsState.updateSetting(key, value),
  updateSettings: (updates: any) => modsState.updateSettings(updates),
  init: () => modsState.init()
};
