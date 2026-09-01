<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  let {
    href = undefined,
    external = false,
    type = 'button',
    variant = 'tint',
    tone = 'accent',
    disabled = false,
    label = undefined,
    class: className = '',
    onclick = undefined,
    children,
    icon
  } = $props<{
    href?: string;
    external?: boolean;
    type?: 'button' | 'submit';
    variant?: 'tint' | 'fill' | 'raised' | 'bare';
    tone?: 'accent' | 'neutral' | 'danger';
    disabled?: boolean;
    label?: string;
    class?: string;
    onclick?: MouseEventHandler<HTMLButtonElement>;
    children?: Snippet;
    icon?: Snippet;
  }>();
</script>

{#if href && !disabled}
  <a
    class="btn {variant} {tone} {className}"
    {href}
    aria-label={label}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    {#if icon}<span class="icon">{@render icon()}</span>{/if}
    {#if children}{@render children()}{/if}
  </a>
{:else}
  <button
    class="btn {variant} {tone} {className}"
    {type}
    {disabled}
    aria-label={label}
    {onclick}
  >
    {#if icon}<span class="icon">{@render icon()}</span>{/if}
    {#if children}{@render children()}{/if}
  </button>
{/if}

<style>
  /* Box, state and motion only. Radius, padding and typography belong to the call site.
     Every value that differs between call sites comes through a hook. */
  .btn {
    --btn-tint: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    box-shadow: var(--btn-shadow, none);
    transition:
      var(--transition-colors),
      transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
  }

  .neutral {
    --btn-tint: var(--text-muted);
  }

  .danger {
    --btn-tint: var(--status-negative);
  }

  .tint {
    background: color-mix(in srgb, var(--btn-tint) var(--btn-fill, 12%), transparent);
    border: 1px solid color-mix(in srgb, var(--btn-tint) var(--btn-edge, 35%), transparent);
  }

  .raised {
    background: color-mix(in srgb, var(--btn-surface, var(--surface-raised)) var(--btn-fill, 92%), transparent);
    border: 1px solid color-mix(in srgb, var(--btn-tint) var(--btn-edge, 24%), transparent);
  }

  .fill {
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--btn-tint) var(--btn-edge, 100%), transparent);
  }

  .bare {
    background: none;
    border: none;
  }

  .btn:not(:disabled):hover {
    transform: var(--btn-raise, none);
    box-shadow: var(--btn-shadow-hover, var(--btn-shadow, none));
  }

  .tint:not(:disabled):hover {
    background: color-mix(in srgb, var(--btn-tint) var(--btn-fill-hover, 20%), transparent);
    border-color: color-mix(in srgb, var(--btn-tint) var(--btn-edge-hover, 55%), transparent);
  }

  .raised:not(:disabled):hover {
    background: color-mix(in srgb, var(--btn-tint) var(--btn-fill-hover, 12%), var(--btn-surface, var(--surface-raised)));
    border-color: color-mix(in srgb, var(--btn-tint) var(--btn-edge-hover, 42%), transparent);
  }

  .fill:not(:disabled):hover {
    background: var(--btn-tint);
    border-color: var(--btn-tint);
    color: var(--btn-fill-text, var(--text-on-accent));
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .icon {
    display: inline-flex;
    flex-shrink: 0;
  }
</style>
