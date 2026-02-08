<script lang="ts">
  import { t } from '$lib/stores/i18n';
  import { useHoverConfig, type HoverConfig } from '$lib/stores/hoverConfig';
  import { mods } from '$lib/stores/customization';

  let searchQuery = '';
  let searchInput: HTMLInputElement;
  let suggestions: string[] = [];
  let selectedSuggestion = -1;
  let searchTimeoutId: ReturnType<typeof setTimeout> | undefined;

  $: openLinksInNewTabs = $mods.openLinksInNewTabs;

  const hoverConfigs: HoverConfig[] = [
    {
      selectors: ['.newhome-search', '.search-wrapper'],
      className: 'hovered-new-search',
      requireAllSelectors: true,
      lockPosition: true,
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
      searchInput.blur();
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
        on:input={handleSearchInput}
        on:keydown={handleKeyDown}
        type="text"
        placeholder={$t('newhome.search.placeholder', 'Search with SearXNG...')}
        class="search-input"
      />
      <button on:click={() => handleSearch()} class="search-button" title={$t('newhome.search.button', 'Search')}>
        <img src="/icons/buttons/search.svg" class="search-icon" alt={$t('newhome.search.button', 'Search')}/>
      </button>
    </div>
  </div>
</div>

<style>
  .search-section {
    width: 100%;
    max-width: 24vw;
    max-height: 10vh;
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
    border: .2vh solid rgba(246, 89, 1, 0.3);
    border-radius: 1.65vh;
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

  @media (max-width: 73.4px) {
    .search-section {
      max-width: 50vh;
    }
  }

  @media (max-width: 48vh) {
    .search-input {
      font-size: 1rem;
      padding: 0.8rem 1.2rem;
    }

    .search-button {
      padding: 0.8rem 1.2rem;
    }
  }
</style>