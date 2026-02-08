<script lang="ts">
  import { currentLocale, currentLocaleInfo, availableLocales, setLocale, type AvailableLocale } from '$lib/stores/i18n';
  import { slide } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  
  let isOpen = false;
  let currentInfo: AvailableLocale;
  
  $: currentInfo = $currentLocaleInfo;
  
  function handleClickOutside(event: MouseEvent) {
    if (isOpen) {
      const dropdown = document.querySelector('.language-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        isOpen = false;
      }
    }
  }

  function handleCloseLanguageDropdown() {
    isOpen = false;
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('closeLanguageDropdown', handleCloseLanguageDropdown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('closeLanguageDropdown', handleCloseLanguageDropdown);
    };
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('closeLanguageDropdown', handleCloseLanguageDropdown);
    }
  });
  
  async function handleLocaleChange(locale: string) {
    await setLocale(locale);
    isOpen = false;
  }
  
  function toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    isOpen = !isOpen;
  }
</script>

<div class="language-selector">
  <button 
    type="button" 
    class="language-button"
    on:click={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <span class="flag">{currentInfo?.flag || '🇺🇸'}</span>
    <span class="language-name">{currentInfo?.name || 'English (US)'}</span>
    <span class="dropdown-arrow" class:open={isOpen}>▼</span>
  </button>
  
  {#if isOpen}
    <div class="language-dropdown" transition:slide={{ duration: 200 }} role="listbox">
      {#each availableLocales as locale}
        <button
          type="button"
          class="language-option"
          class:active={$currentLocale === locale.code}
          on:click={() => handleLocaleChange(locale.code)}
          role="option"
          aria-selected={$currentLocale === locale.code}
        >
          <span class="flag">{locale.flag}</span>
          <span class="language-name">{locale.name}</span>
          {#if $currentLocale === locale.code}
            <span class="checkmark">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .language-selector {
    position: relative;
    display: inline-block;
    width: 18vh;
  }
  
  .language-button {
    background: none;
    border: 1px solid #f65901;
    color: #f65901;
    padding: 0.5vh 1vh;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vh;
    transition: background-color 0.2s;
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }
  
  .language-button:hover {
    background-color: rgba(246, 89, 1, 0.1);
  }
  
  .flag {
    font-size: 1rem;
    display: inline-block;
    flex-shrink: 0;
  }
  
  .language-name {
    font-size: 0.9rem;
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  
  .dropdown-arrow {
    font-size: 0.8rem;
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  
  .dropdown-arrow.open {
    transform: rotate(180deg);
  }
  
  .language-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--bg-secondary, #1a1a1a);
    border: 1px solid #f65901;
    border-radius: 4px;
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }
  
  .language-option {
    width: 100%;
    background: none;
    border: none;
    color: #f65901;
    padding: 0.5vh 1vh;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vh;
    transition: background-color 0.2s;
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
  }
  
  .language-option:hover {
    background-color: rgba(246, 89, 1, 0.1);
  }
  
  .language-option.active {
    background-color: rgba(246, 89, 1, 0.2);
    font-weight: 500;
  }
  
  .language-option .flag {
    flex-shrink: 0;
  }
  
  .language-option .language-name {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  
  .checkmark {
    color: #f65901;
    font-weight: bold;
    font-size: 0.9rem;
    flex-shrink: 0;
  }
  
  :global([data-color-scheme="light"]) .language-dropdown {
    background: var(--bg-secondary, #f0f0f0);
    color: #333;
  }
  
  :global([data-color-scheme="light"]) .language-button,
  :global([data-color-scheme="light"]) .language-option {
    color: #f65901;
  }
</style>