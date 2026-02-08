import { writable, get } from 'svelte/store';
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

function createModsStore() {
  const { subscribe, set, update } = writable<ModsConfig>(DEFAULT_MODS);

  return {
    subscribe,
    
    init: () => {
      if (!browser) return;
      
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
        
        saveMods(config);
      }
      
      set(config);
    },
    
    updateSetting: <K extends keyof ModsConfig>(key: K, value: ModsConfig[K]) => {
      update(current => {
        const newConfig = { ...current, [key]: value };
        saveMods(newConfig);
        return newConfig;
      });
    },
    
    updateSettings: (updates: Partial<ModsConfig>) => {
      update(current => {
        const newConfig = { ...current, ...updates };
        saveMods(newConfig);
        return newConfig;
      });
    },
    
    getCurrent: (): ModsConfig => {
      return get({ subscribe });
    }
  };
}

function saveMods(config: ModsConfig) {
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

export const mods = createModsStore();