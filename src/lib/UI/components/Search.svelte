<script lang="ts">
  import { t } from '$lib/stores/i18n.svelte';
  import { useHoverConfig, type HoverConfig } from '$lib/stores/hoverConfig.svelte';
  import { modsState } from '$lib/stores/customization.svelte';

  let searchQuery = $state('');
  let searchInput: HTMLInputElement | undefined = $state();
  let suggestions: string[] = $state([]);
  let selectedSuggestion = $state(-1);
  let searchTimeoutId: ReturnType<typeof setTimeout> | undefined;

  let openLinksInNewTabs = $derived(modsState.config.openLinksInNewTabs);

  const hoverConfigs: HoverConfig[] = [
    {
      selectors: ['.newhome-search', '.search-wrapper'],
      className: 'hovered-new-search',
      requireAllSelectors: true,
      lockPosition: true,
      trackingTarget: '.search-wrapper',
      borderRadius: 1.65
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
    max-width: 42.48vmin;
    max-height: 10vmin;
    margin-bottom: 3rem;
    position: relative;
    z-index: 10;
  }

  .newhome-search {
    position: relative;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    background: rgba(246, 89, 1, 0.1);
    border: .2vmin solid rgba(246, 89, 1, 0.3);
    border-radius: 1.65vmin;
    overflow: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .search-wrapper:focus-within {
    border-color: rgba(246, 89, 1, 0.6);
    box-shadow: 0 0 20px rgba(246, 89, 1, 0.2);
    transform: translateY(-2px);
  }

  .search-icon {
    position: relative;
    height: auto;
    width: auto;
  }

  .search-input {
    flex: 1;
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    font-size: 1.1rem;
    font-family: 'Redwing';
    color: inherit;
    outline: none;
  }

  .search-input::placeholder {
    color: rgba(246, 89, 1, 0.6);
  }

  .search-button {
    position: relative;
    width: 15%;
    min-width: 3.25rem;
    padding: 1rem 1.5rem;
    background: rgba(246, 89, 1, 0.2);
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: inherit;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-button:hover {
    background: rgba(246, 89, 1, 0.4);
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .search-section {
      max-width: min(100%, 34rem);
      max-height: none;
      margin-bottom: 2rem;
    }

    .search-wrapper {
      border-radius: 1rem;
    }

    .search-input {
      font-size: 1rem;
      padding: 0.95rem 1rem;
    }

    .search-button {
      padding: 0.95rem 1rem;
    }

    .search-icon {
      width: 1.2rem;
      height: 1.2rem;
    }
  }

  @media (max-width: 640px) {
    .search-section {
      max-width: 100%;
    }
  }
</style>
