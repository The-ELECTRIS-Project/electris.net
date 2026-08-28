<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    href = undefined,
    external = false,
    variant = 'raised',
    size = 'default',
    disabled = false,
    muted = false,
    class: className = '',
    children
  } = $props<{
    href?: string;
    external?: boolean;
    variant?: 'raised' | 'outline' | 'flat';
    size?: 'compact' | 'default';
    disabled?: boolean;
    muted?: boolean;
    class?: string;
    children: Snippet;
  }>();

  let interactive = $derived(Boolean(href) && !disabled);
</script>

{#if interactive}
  <a
    class="card {variant} {size} {className}"
    class:muted
    {href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    {@render children()}
  </a>
{:else}
  <div class="card {variant} {size} {className}" class:disabled class:muted>
    {@render children()}
  </div>
{/if}

<style>
  .card {
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
    border-radius: var(--radius-md);
    text-decoration: none;
    color: inherit;
    transition:
      background-color var(--duration-slow) var(--ease-in-out),
      border-color var(--duration-slow) var(--ease-in-out),
      transform var(--duration-slow) var(--ease-in-out),
      box-shadow var(--duration-slow) var(--ease-in-out);
  }

  .default {
    padding: var(--space-5);
  }

  .compact {
    padding: var(--space-4);
  }

  .raised {
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .outline {
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  }

  .flat {
    background: var(--surface-raised);
    border: 1px solid transparent;
  }

  a.card:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-color: color-mix(in srgb, var(--accent) 50%, transparent);
    transform: translateY(-0.25rem);
    box-shadow: var(--shadow-md);
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
