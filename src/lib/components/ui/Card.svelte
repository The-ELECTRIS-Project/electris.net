<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    href = undefined,
    external = false,
    variant = 'accent',
    hover = 'lift',
    disabled = false,
    muted = false,
    class: className = '',
    children
  } = $props<{
    href?: string;
    external?: boolean;
    variant?: 'accent' | 'raised' | 'outline' | 'plain';
    hover?: 'lift' | 'grow' | 'none';
    disabled?: boolean;
    muted?: boolean;
    class?: string;
    children: Snippet;
  }>();

  let interactive = $derived(Boolean(href) && !disabled);
</script>

{#if interactive}
  <a
    class="card {variant} {hover} {className}"
    class:muted
    {href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    {@render children()}
  </a>
{:else}
  <div class="card {variant} {className}" class:disabled class:muted>
    {@render children()}
  </div>
{/if}

<style>
  /* Surface, state and motion only. Layout, padding and typography belong to the page.
     Static properties it overrides directly; the two hover values come through the hooks. */
  .card {
    position: relative;
    border-radius: var(--radius-md);
    color: inherit;
    text-decoration: none;
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
  }

  .accent {
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .raised {
    background: var(--surface-raised);
  }

  .outline {
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  }

  .plain {
    background: transparent;
    border: 1px solid transparent;
  }

  a.accent:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  }

  a.outline:hover {
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  }

  a.lift:hover {
    transform: translateY(var(--card-lift, -0.25rem));
    box-shadow: var(--card-shadow, none);
  }

  a.grow:hover {
    transform: scale(1.02);
    box-shadow: var(--card-shadow, none);
  }

  .disabled {
    opacity: 0.5;
    background: color-mix(in srgb, var(--accent) 2%, transparent);
    border-color: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .muted {
    opacity: 0.6;
    filter: grayscale(0.5);
  }
</style>
