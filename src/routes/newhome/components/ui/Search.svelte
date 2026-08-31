<script lang="ts">
  import { t } from '$lib/state/i18n.svelte';
  import { useHoverConfig, type HoverConfig } from '$lib/state/hoverConfig.svelte';
  import { modsState } from '$lib/state/mods.svelte';

  let searchQuery = $state('');
  let searchInput: HTMLInputElement | undefined = $state();
  let suggestions: string[] = $state([]);
  let selectedSuggestion = $state(-1);
  let searchTimeoutId: ReturnType<typeof setTimeout> | undefined;

  let openLinksInNewTabs = $derived(modsState.config.newHome.openLinksInNewTabs);

  const hoverConfigs: HoverConfig[] = [
    {
      selectors: ['.newhome-search', '.search-wrapper'],
      className: 'hovered-new-search',
      requireAllSelectors: true,
      lockPosition: true,
      dynamicSizeOffset: 0.2,
      dynamicBorderRadiusOffset: 0.2,
      trackingTarget: '.search-wrapper'
    }
  ];

  useHoverConfig(hoverConfigs);

  async function handleSearch(query: string = searchQuery) {
    if (!query.trim()) return;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://searxng.electris.net/search';
    form.target = openLinksInNewTabs ? '_blank' : '_self';
    form.style.display = 'none';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'q';
    input.value = query;
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    searchQuery = '';
  }

  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      selectedSuggestion = -1;
      searchInput?.blur();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        handleSearch(suggestions[selectedSuggestion]);
      } else {
        handleSearch();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedSuggestion = Math.min(selectedSuggestion + 1, suggestions.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedSuggestion = Math.max(selectedSuggestion - 1, -1);
    }
  }
</script>

<div class="wrap-no-interact-all search-section">
  <div class="newhome-search">
    <div class="search-wrapper">
      <input
        bind:this={searchInput}
        bind:value={searchQuery}
        oninput={handleSearchInput}
        onkeydown={handleKeyDown}
        type="text"
        placeholder={t('newhome.search.placeholder', 'Search with SearXNG...')}
        class="search-input"
      />
      <button onclick={() => handleSearch()} class="search-button" title={t('newhome.search.button', 'Search')}>
        <img src="/icons/buttons/search.svg" class="search-icon" alt={t('newhome.search.button', 'Search')}/>
      </button>
    </div>
  </div>
</div>

<style>
  .search-section {
    width: 100%;
    max-width: min(100%, 32rem);
    margin-bottom: var(--space-7);
    position: relative;
    z-index: var(--z-sticky);
  }

  .newhome-search {
    position: relative;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition:
      var(--transition-colors),
      box-shadow var(--duration-slow) var(--ease-out),
      transform var(--duration-slow) var(--ease-out);
    backdrop-filter: blur(10px);
  }

  .search-wrapper:focus-within {
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    box-shadow: 0 0 var(--space-5) color-mix(in srgb, var(--accent) 20%, transparent);
    transform: translateY(-0.15rem);
  }

  .search-icon {
    position: relative;
    height: auto;
    width: auto;
  }

  .search-input {
    flex: 1;
    padding: var(--space-4) var(--space-5);
    background: transparent;
    border: none;
    font-size: var(--text-md);
    font-family: var(--font-body);
    color: inherit;
    outline: none;
  }

  .search-input::placeholder {
    color: color-mix(in srgb, var(--accent) 60%, transparent);
  }

  .search-button {
    position: relative;
    width: 15%;
    min-width: 3.25rem;
    padding: var(--space-4) var(--space-5);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border: none;
    cursor: pointer;
    font-size: var(--text-lg);
    color: inherit;
    transition: var(--transition-colors);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-button:hover {
    background: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .search-section {
      margin-bottom: var(--space-6);
    }

    .search-input {
      font-size: var(--text-base);
      padding: var(--space-4);
    }

    .search-button {
      padding: var(--space-4);
    }

    .search-icon {
      width: 1.2rem;
      height: 1.2rem;
    }
  }
</style>
