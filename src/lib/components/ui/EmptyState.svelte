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
  {#if icon}
    <div class="empty-icon">
      <img src={icon} alt="" />
    </div>
  {/if}
  <h2>{title}</h2>
  {#if description}<p>{description}</p>{/if}
  {#if children}{@render children()}{/if}
</div>

<style>
  /* Structure only. Sizes, colours and spacing belong to the page. */
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: var(--radius-round);
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
  }

  p {
    margin: 0;
  }
</style>
