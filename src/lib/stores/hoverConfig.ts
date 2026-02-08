import { onMount } from 'svelte';
import { writable } from 'svelte/store';

export interface HoverConfig {
  type?: string[];
  selectors: string[];
  className: string;
  lockPosition?: boolean;
  requireAllSelectors?: boolean;
  preventRotation?: boolean;
  trackingTarget?: string;
  shape?: 'circle' | 'rect' | 'text';
  wrapText?: {
    words?: boolean;
    sentences?: boolean;
    ignorePunctuation?: boolean;
    ignoreCharacters?: boolean;
  };
  
  customEvent?: {
    hovered: string;
    unhovered: string;
  };
  
  customPositioning?: {
    targetSelector: string;
    offsetX?: number;
    offsetY?: number;
  };
}

const defaultHoverConfigs: HoverConfig[] = [
  {
    selectors: [
      'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'p'
    ],
    className: 'hovered-word-wrap',
    lockPosition: true,
    requireAllSelectors: false,
    wrapText: {
      words: true,
      sentences: false,
      ignorePunctuation: true,
      ignoreCharacters: false
    }
  },
  {
    selectors: [
      '.option',
      '.devtools-option',
      '.card'
    ],
    className: 'hovered-button-grow',
    lockPosition: false,
    requireAllSelectors: false
  }
];

function createHoverConfigStore() {
  const { subscribe, update } = writable<HoverConfig[]>(defaultHoverConfigs);

  return {
    subscribe,

    addConfigs: (configs: HoverConfig[]) => {
      update(existingConfigs => [...existingConfigs, ...configs]);
    },
    
    removeConfigs: (configs: HoverConfig[]) => {
      update(existingConfigs => {
        return existingConfigs.filter(existing => 
          !configs.some(toRemove => 
            JSON.stringify(existing) === JSON.stringify(toRemove)
          )
        );
      });
    },
    
    resetToDefaults: () => {
      update(() => [...defaultHoverConfigs]);
    }
  };
}

export function useHoverConfig(configs: HoverConfig[]) {
  onMount(() => {
    hoverConfigStore.addConfigs(configs);

    return () => {
      hoverConfigStore.removeConfigs(configs);
    };
  });
}

export const hoverConfigStore = createHoverConfigStore();