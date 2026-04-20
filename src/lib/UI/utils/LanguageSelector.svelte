<script lang="ts">
  import { i18nState, availableLocales, setLocale } from '$lib/stores/i18n.svelte';
  import { slide } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  
  let isOpen = $state(false);
  let currentInfo = $derived(i18nState.currentLocaleInfo);
  
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
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('closeLanguageDropdown', handleCloseLanguageDropdown);
    }
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
    onclick={toggleDropdown}
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
          class:active={i18nState.currentLocale === locale.code}
          onclick={() => handleLocaleChange(locale.code)}
          role="option"
          aria-selected={i18nState.currentLocale === locale.code}
        >
          <span class="flag">{locale.flag}</span>
          <span class="language-name">{locale.name}</span>
          {#if i18nState.currentLocale === locale.code}
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
    width: 18vmin;
  }
  
  .language-button {
    background: none;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    padding: 0.5vmin 1vmin;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vmin;
    transition: background-color 0.2s;
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }
  
  .language-button:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
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
    background: var(--bg-secondary);
    border: 1px solid var(--color-primary);
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
    color: var(--color-primary);
    padding: 0.5vmin 1vmin;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5vmin;
    transition: background-color 0.2s;
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
  }
  
  .language-option:hover {
    background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }
  
  .language-option.active {
    background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
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
    color: var(--color-primary);
    font-weight: bold;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .language-selector {
      width: 100%;
      max-width: none;
    }

    .language-button {
      min-height: 3rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      gap: 0.75rem;
    }

    .flag {
      font-size: 1.1rem;
    }

    .language-name {
      font-size: 1rem;
    }

    .dropdown-arrow,
    .checkmark {
      font-size: 0.95rem;
    }

    .language-dropdown {
      max-height: min(18rem, 45vh);
      border-radius: 0.75rem;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      overflow: hidden auto;
    }

    .language-option {
      min-height: 3rem;
      padding: 0.75rem 1rem;
      gap: 0.75rem;
    }
  }
</style>
