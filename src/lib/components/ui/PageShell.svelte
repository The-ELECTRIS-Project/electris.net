<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    width = 'full',
    align = 'start',
    class: className = '',
    children
  } = $props<{
    width?: 'prose' | 'content' | 'wide' | 'full';
    align?: 'start' | 'center';
    class?: string;
    children: Snippet;
  }>();
</script>

<div class="shell {width} {align} {className}">
  {@render children()}
</div>

<style>
  /* The route's outer box: full height, centred, clear of the navbar.
     Everything below the padding line belongs to the page. */
  .shell {
    min-height: 100vh;
    margin: 0 auto;
    padding:
      var(--shell-pad-top, var(--layout-page-top))
      var(--shell-pad-inline, var(--layout-page-inline))
      var(--shell-pad-bottom, var(--space-8));
  }

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .prose {
    max-width: var(--shell-max, var(--layout-measure));
  }

  .content {
    max-width: var(--shell-max, var(--layout-content));
  }

  .wide {
    max-width: var(--shell-max, var(--layout-max));
  }

  .full {
    max-width: var(--shell-max, none);
  }
</style>
