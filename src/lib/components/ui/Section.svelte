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
        {#if title}<h2 class="section-title">{title}</h2>{/if}
        {#if description}<p class="section-description">{description}</p>{/if}
      </div>
      {#if actions}<div class="section-actions">{@render actions()}</div>{/if}
    </div>
  {/if}

  {@render children()}
</section>

<style>
  /* Structure only. Spacing, rules and typography belong to the page. */
  .section {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .section-header {
    display: flex;
    align-items: center;
  }

  .section-media {
    display: inline-flex;
    flex-shrink: 0;
  }

  .section-copy {
    flex-grow: 1;
  }

  .section-actions {
    flex-shrink: 0;
  }

  .section-title {
    margin: 0;
  }

  .section-description {
    margin: 0;
  }
</style>
