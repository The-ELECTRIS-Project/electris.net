<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    width = 'default',
    title = undefined,
    kicker = undefined,
    lead = undefined,
    align = 'center',
    class: className = '',
    children,
    header
  } = $props<{
    width?: 'prose' | 'default' | 'wide' | 'full';
    title?: string;
    kicker?: string;
    lead?: string;
    align?: 'start' | 'center';
    class?: string;
    children: Snippet;
    header?: Snippet;
  }>();
</script>

<div class="shell {width} {align} {className}">
  {#if header}
    <header class="page-header">{@render header()}</header>
  {:else if title || kicker || lead}
    <header class="page-header">
      {#if kicker}<p class="kicker">{kicker}</p>{/if}
      {#if title}<h1>{title}</h1>{/if}
      {#if lead}<p class="lead">{lead}</p>{/if}
    </header>
  {/if}

  {@render children()}
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin: 0 auto;
    padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
  }

  .center {
    align-items: center;
  }

  .prose {
    max-width: var(--layout-measure);
  }

  .default {
    max-width: var(--layout-content);
  }

  .wide {
    max-width: var(--layout-max);
  }

  .full {
    max-width: none;
  }

  .page-header {
    margin-bottom: var(--space-7);
    text-align: inherit;
  }

  .center .page-header {
    text-align: center;
  }

  .kicker {
    margin: 0 0 var(--space-2);
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.8;
  }

  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--display-md);
  }

  .lead {
    margin: var(--space-3) 0 0;
    font-family: var(--font-body);
    font-size: var(--text-md);
    opacity: 0.9;
  }
</style>
