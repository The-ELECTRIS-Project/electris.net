<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    tone = 'accent',
    size = 'md',
    class: className = '',
    children
  } = $props<{
    tone?: 'neutral' | 'accent' | 'info' | 'positive' | 'danger';
    size?: 'sm' | 'md';
    class?: string;
    children: Snippet;
  }>();
</script>

<span class="badge {tone} {size} {className}">{@render children()}</span>

<style>
  .badge {
    font-family: var(--font-body);
    text-transform: uppercase;
    white-space: nowrap;
    width: fit-content;
    border-radius: var(--radius-xs);
  }

  .md {
    font-size: var(--text-2xs);
    padding: var(--space-1) var(--space-2);
  }

  .sm {
    font-size: var(--text-2xs);
    padding: 0.125rem var(--space-2);
  }

  .accent {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    color: inherit;
  }

  .neutral {
    background: color-mix(in srgb, var(--text-muted) 20%, transparent);
    color: var(--text-secondary);
  }

  /* Fixed in every scheme, so a state reads the same way wherever the badge is used. */
  .info {
    background: #4444ff;
    color: var(--text-on-accent);
  }

  .positive {
    background: var(--status-positive-bg);
    border: 1px solid var(--status-positive-border);
  }

  .danger {
    background: #ff4444;
    color: var(--text-on-accent);
  }
</style>
