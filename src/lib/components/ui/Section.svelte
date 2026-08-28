<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title = undefined,
    description = undefined,
    id = undefined,
    class: className = '',
    children,
    media,
    actions
  } = $props<{
    title?: string;
    description?: string;
    id?: string;
    class?: string;
    children: Snippet;
    media?: Snippet;
    actions?: Snippet;
  }>();
</script>

<section {id} class="section {className}">
  {#if title || description || media || actions}
    <div class="section-header">
      {#if media}<span class="section-media">{@render media()}</span>{/if}
      <div class="section-copy">
        {#if title}<h2>{title}</h2>{/if}
        {#if description}<p>{description}</p>{/if}
      </div>
      {#if actions}<div class="section-actions">{@render actions()}</div>{/if}
    </div>
  {/if}

  {@render children()}
</section>

<style>
  .section {
    width: 100%;
    margin-bottom: var(--space-8);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
  }

  .section-media {
    display: inline-flex;
    flex-shrink: 0;
  }

  .section-copy {
    flex-grow: 1;
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    text-transform: uppercase;
  }

  p {
    margin: var(--space-1) 0 0;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    opacity: 0.8;
  }

  .section-actions {
    flex-shrink: 0;
  }
</style>
