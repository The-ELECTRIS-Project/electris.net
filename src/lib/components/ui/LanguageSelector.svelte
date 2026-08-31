<script lang="ts">
  import { i18nState, availableLocales, setLocale } from '$lib/state/i18n.svelte';
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
    width: 13rem;
  }

  .language-button {
    background: none;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-xs);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-1);
    transition: var(--transition-colors);
    font-family: inherit;
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .language-button:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .flag {
    font-size: var(--text-base);
    display: inline-block;
    flex-shrink: 0;
  }

  .language-name {
    font-size: var(--text-sm);
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .dropdown-arrow {
    font-size: var(--text-2xs);
    transition: transform var(--duration-normal) var(--ease-out);
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
    background: var(--surface-sunken);
    border: 1px solid var(--accent);
    border-radius: var(--radius-xs);
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    z-index: var(--z-popup);
    max-height: 12.5rem;
    overflow-y: auto;
    box-shadow: var(--shadow-sm);
    box-sizing: border-box;
  }

  .language-option {
    width: 100%;
    background: none;
    border: none;
    color: var(--accent);
    padding: var(--space-1) var(--space-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-1);
    transition: var(--transition-colors);
    font-family: inherit;
    text-align: left;
    box-sizing: border-box;
  }

  .language-option:hover {
    background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .language-option.active {
    background-color: color-mix(in srgb, var(--accent) 20%, transparent);
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
    color: var(--accent);
    font-weight: bold;
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .language-selector {
      width: 100%;
      max-width: none;
    }

    .language-button {
      min-height: var(--touch-target-size);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      gap: var(--space-3);
    }

    .flag {
      font-size: var(--text-md);
    }

    .language-name {
      font-size: var(--text-base);
    }

    .dropdown-arrow,
    .checkmark {
      font-size: var(--text-sm);
    }

    .language-dropdown {
      max-height: min(18rem, 45vh);
      border-radius: var(--radius-md);
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      overflow: hidden auto;
    }

    .language-option {
      min-height: var(--touch-target-size);
      padding: var(--space-3) var(--space-4);
      gap: var(--space-3);
    }
  }
</style>
