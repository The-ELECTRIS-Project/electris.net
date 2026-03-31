import { onMount } from 'svelte';

export interface HoverConfig {
  type?: string[];
  selectors: string[];
  className: string;
  lockPosition?: boolean;
  requireAllSelectors?: boolean;
  preventRotation?: boolean;
  trackingTarget?: string;
  shape?: 'circle' | 'rect' | 'text';
  color?: string;
  matchRotation?: boolean;
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
      '.devtools-option'
    ],
    className: 'hovered-button-grow',
    lockPosition: false,
    requireAllSelectors: false
  }
];

class HoverConfigState {
  configs = $state<HoverConfig[]>([...defaultHoverConfigs]);

  addConfigs(newConfigs: HoverConfig[]) {
    this.configs = [...this.configs, ...newConfigs];
  }

  removeConfigs(configsToRemove: HoverConfig[]) {
    this.configs = this.configs.filter(existing => 
      !configsToRemove.some(toRemove => 
        JSON.stringify(existing) === JSON.stringify(toRemove)
      )
    );
  }

  resetToDefaults() {
    this.configs = [...defaultHoverConfigs];
  }
}

export const hoverConfigState = new HoverConfigState();

export function useHoverConfig(configs: HoverConfig[]) {
  onMount(() => {
    hoverConfigState.addConfigs(configs);

    return () => {
      hoverConfigState.removeConfigs(configs);
    };
  });
}

// Backward compatibility
export const hoverConfigStore = {
  get configs() { return hoverConfigState.configs; },
  addConfigs: (configs: HoverConfig[]) => hoverConfigState.addConfigs(configs),
  removeConfigs: (configs: HoverConfig[]) => hoverConfigState.removeConfigs(configs),
  resetToDefaults: () => hoverConfigState.resetToDefaults()
};
