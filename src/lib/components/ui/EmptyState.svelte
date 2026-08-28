<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    description = undefined,
    icon = undefined,
    class: className = '',
    children
  } = $props<{
    title: string;
    description?: string;
    icon?: string;
    class?: string;
    children?: Snippet;
  }>();
</script>

<div class="empty {className}">
  {#if icon}<img class="empty-icon" src={icon} alt="" />{/if}
  <h2>{title}</h2>
  {#if description}<p>{description}</p>{/if}
  {#if children}{@render children()}{/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-5);
    text-align: center;
    border-radius: var(--radius-xl);
    border: 1px dashed color-mix(in srgb, var(--accent) 22%, transparent);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    object-fit: contain;
    opacity: 0.6;
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-xl);
  }

  p {
    margin: 0;
    max-width: var(--layout-measure);
    font-family: var(--font-body);
    opacity: 0.85;
  }
</style>
