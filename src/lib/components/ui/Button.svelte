<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  let {
    href = undefined,
    external = false,
    type = 'button',
    variant = 'outline',
    size = 'md',
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
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
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
    class="btn {variant} {size} {tone} {className}"
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
    class="btn {variant} {size} {tone} {className}"
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
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border-radius: var(--radius-pill);
    font-family: var(--font-ui);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      background-color var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .sm {
    padding: var(--space-2) var(--space-3);
    font-size: 0.72rem;
  }

  .md {
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-2xs);
  }

  .lg {
    padding: var(--space-4) var(--space-5);
    font-size: var(--text-sm);
  }

  .accent {
    --btn-tint: var(--accent);
  }

  .neutral {
    --btn-tint: var(--text-muted);
  }

  .danger {
    --btn-tint: #ff4444;
  }

  .outline {
    border: 1px solid color-mix(in srgb, var(--btn-tint) 24%, transparent);
    background: color-mix(in srgb, var(--surface-raised) 92%, transparent);
    box-shadow: var(--shadow-md);
  }

  .solid {
    border: 1px solid color-mix(in srgb, var(--btn-tint) 40%, transparent);
    background: color-mix(in srgb, var(--btn-tint) 16%, transparent);
    color: var(--btn-tint);
  }

  .ghost {
    border: 1px solid color-mix(in srgb, var(--btn-tint) 24%, transparent);
    background: transparent;
  }

  .link {
    border: none;
    background: none;
    padding: 0;
    letter-spacing: normal;
    text-transform: none;
    color: var(--btn-tint);
  }

  .btn:not(.link):not(:disabled):hover {
    transform: translateY(-0.2rem);
    border-color: color-mix(in srgb, var(--btn-tint) 42%, transparent);
    background: color-mix(in srgb, var(--btn-tint) 12%, var(--surface-raised));
    box-shadow: var(--shadow-lg);
  }

  .link:hover {
    text-decoration: underline;
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
