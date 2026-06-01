<script lang="ts">
  import { t } from '$lib/state/i18n.svelte';
  import { slide } from 'svelte/transition';

  let { tags, selectedTags = $bindable([]), onClear } = $props<{
    tags: string[];
    selectedTags: string[];
    onClear?: () => void;
  }>();

  let isOpen = $state(false);

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((t: string) => t !== tag);
    } else {
      selectedTags = [...selectedTags, tag];
    }
  }

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  function closeMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (isOpen && !target.closest('.tag-filter-container')) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={closeMenu} onkeydown={handleKeydown} />

<div class="tag-filter-container">
  <div 
    class="filter-trigger" 
    class:active={selectedTags.length > 0}
    onclick={toggleMenu}
    onkeydown={(e) => e.key === 'Enter' && toggleMenu()}
    role="button"
    tabindex="0"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <div class="trigger-content">
      <span class="trigger-label">
        {#if selectedTags.length === 0}
          {t('blog.tags.all')}
        {:else if selectedTags.length === 1}
          {selectedTags[0]}
        {:else}
          {selectedTags.length} {t('blog.tags.selected', 'Tags Selected')}
        {/if}
      </span>
      <div class="trigger-actions">
        {#if selectedTags.length > 0}
          <span 
            class="clear-trigger" 
            onclick={(e) => { e.stopPropagation(); selectedTags = []; if (onClear) onClear(); }}
            onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); selectedTags = []; if (onClear) onClear(); } }}
            role="button"
            tabindex="0"
            aria-label={t('blog.tags.clear')}
          >
            ✕
          </span>
        {:else}
          <span class="trigger-icon" class:rotated={isOpen}>▼</span>
        {/if}
      </div>
    </div>
  </div>

  {#if isOpen}
    <div class="filter-menu" transition:slide={{ duration: 200 }}>
      <div class="menu-header">
        <span class="menu-title">{t('blog.tags.filter', 'Filter by Tags')}</span>
        {#if selectedTags.length > 0}
          <button type="button" class="clear-all" onclick={() => { selectedTags = []; if (onClear) onClear(); }}>
            {t('blog.tags.clear')}
          </button>
        {/if}
      </div>
      <div class="tags-list" role="listbox" aria-multiselectable="true">
        {#each tags as tag}
          <button
            type="button"
            class="tag-option"
            class:selected={selectedTags.includes(tag)}
            onclick={() => toggleTag(tag)}
            role="option"
            aria-selected={selectedTags.includes(tag)}
          >
            <span class="checkbox">
              {#if selectedTags.includes(tag)}
                ✓
              {/if}
            </span>
            <span class="tag-label">{tag}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .tag-filter-container {
    position: relative;
    min-width: 6rem;
    z-index: 100;
  }

  .filter-trigger {
    width: 100%;
    padding: 0.65rem 1rem;
    background: rgba(246, 89, 1, 0.1);
    border: 0.2vmin solid rgba(246, 89, 1, 0.3);
    border-radius: 0.6vmin;
    font-family: 'Redwing';
    font-size: 0.9rem;
    color: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .filter-trigger:hover, .filter-trigger[aria-expanded="true"] {
    border-color: rgba(246, 89, 1, 0.6);
    background: rgba(246, 89, 1, 0.15);
  }

  .filter-trigger.active {
    border-color: var(--accent-color, #ff6811);
    background: rgba(246, 89, 1, 0.15);
  }

  .trigger-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .trigger-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .clear-trigger {
    background: none;
    border: none;
    color: inherit;
    font-size: 0.8rem;
    padding: 0.2rem;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-trigger:hover {
    opacity: 1;
    color: var(--accent-color, #ff6811);
    transform: scale(1.1);
  }

  .trigger-icon {
    font-size: 0.7rem;
    transition: transform 0.3s ease;
    opacity: 0.7;
  }

  .trigger-icon.rotated {
    transform: rotate(180deg);
  }

  .filter-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: #111;
    border: 0.2vmin solid rgba(246, 89, 1, 0.4);
    border-radius: 0.8vmin;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    min-width: 12rem;
  }

  :global([data-color-scheme='light']) .filter-menu {
    background: #fff;
    box-shadow: 0 10px 30px rgba(246, 89, 1, 0.15);
  }

  .menu-header {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(246, 89, 1, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(246, 89, 1, 0.05);
  }

  .menu-title {
    font-family: 'Redwing';
    font-size: 0.8rem;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .clear-all {
    background: none;
    border: none;
    color: var(--accent-color, #ff6811);
    font-family: 'Redwing';
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.2rem 0.5rem;
    border-radius: 0.3rem;
    transition: background 0.2s;
  }

  .clear-all:hover {
    background: rgba(246, 89, 1, 0.1);
  }

  .tags-list {
    max-height: 25rem;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .tag-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.7rem 0.8rem;
    background: none;
    border: none;
    color: inherit;
    font-family: 'Redwing';
    font-size: 0.95rem;
    text-align: left;
    cursor: pointer;
    border-radius: 0.4rem;
    transition: all 0.2s;
  }

  .tag-option:hover {
    background: rgba(246, 89, 1, 0.1);
  }

  .tag-option.selected {
    color: var(--accent-color, #ff6811);
    background: rgba(246, 89, 1, 0.08);
  }

  .checkbox {
    width: 1.2rem;
    height: 1.2rem;
    border: 1px solid rgba(246, 89, 1, 0.4);
    border-radius: 0.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .tag-option.selected .checkbox {
    background: var(--accent-color, #ff6811);
    border-color: var(--accent-color, #ff6811);
    color: white;
  }

  /* Custom Scrollbar */
  .tags-list::-webkit-scrollbar {
    width: 4px;
  }

  .tags-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .tags-list::-webkit-scrollbar-thumb {
    background: rgba(246, 89, 1, 0.3);
    border-radius: 10px;
  }

  .tags-list::-webkit-scrollbar-thumb:hover {
    background: rgba(246, 89, 1, 0.5);
  }
</style>
