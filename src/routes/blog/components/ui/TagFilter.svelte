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
    z-index: var(--z-sticky);
  }

  .filter-trigger {
    width: 100%;
    padding: var(--space-2) var(--space-4);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: inherit;
    cursor: pointer;
    transition: var(--transition-colors);
    text-align: left;
  }

  .filter-trigger:hover, .filter-trigger[aria-expanded="true"] {
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    background: color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .filter-trigger.active {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .trigger-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
  }

  .trigger-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .clear-trigger {
    background: none;
    border: none;
    color: inherit;
    font-size: var(--text-xs);
    padding: var(--space-1);
    cursor: pointer;
    opacity: 0.5;
    transition:
      var(--transition-colors),
      opacity var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-trigger:hover {
    opacity: 1;
    color: var(--accent);
    transform: scale(1.1);
  }

  .trigger-icon {
    font-size: var(--text-2xs);
    transition: transform var(--duration-slow) var(--ease-out);
    opacity: 0.7;
  }

  .trigger-icon.rotated {
    transform: rotate(180deg);
  }

  .filter-menu {
    position: absolute;
    top: calc(100% + var(--space-2));
    left: 0;
    right: 0;
    background: var(--surface-overlay);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    min-width: 12rem;
  }

  .menu-header {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: color-mix(in srgb, var(--accent) 5%, transparent);
  }

  .menu-title {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .clear-all {
    background: none;
    border: none;
    color: var(--accent);
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-xs);
    transition: var(--transition-colors);
  }

  .clear-all:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .tags-list {
    max-height: 25rem;
    overflow-y: auto;
    padding: var(--space-2);
  }

  .tag-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: none;
    border: none;
    color: inherit;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    text-align: left;
    cursor: pointer;
    border-radius: var(--radius-xs);
    transition: var(--transition-colors);
  }

  .tag-option:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .tag-option.selected {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  .checkbox {
    width: 1.2rem;
    height: 1.2rem;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: var(--radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    transition: var(--transition-colors);
    flex-shrink: 0;
  }

  .tag-option.selected .checkbox {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .tags-list::-webkit-scrollbar {
    width: 4px;
  }

  .tags-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .tags-list::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: var(--radius-pill);
  }

  .tags-list::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--accent) 50%, transparent);
  }
</style>
