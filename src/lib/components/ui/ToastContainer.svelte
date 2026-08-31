<script lang="ts">
  import { toastState } from '$lib/state/toast.svelte';
</script>

{#if toastState.toasts.length > 0}
  <div class="toast-container" role="status" aria-live="polite">
    {#each toastState.toasts as toast (toast.id)}
      <div class="toast" style="--duration: {toast.duration}ms">
        {#if toast.icon}
          <img src={toast.icon} class="toast-icon" alt="" aria-hidden="true" />
        {/if}
        <div class="toast-content">
          {#if toast.title}
            <div class="toast-title">{toast.title}</div>
          {/if}
          <div class="toast-message">{toast.message}</div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + var(--layout-page-top));
    left: 50%;
    transform: translate(-50%, 0);
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    pointer-events: none;
    width: max-content;
    max-width: 90vw;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-5);
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--surface-overlay) 88%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    color: var(--accent);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    letter-spacing: 0.01em;
    box-shadow:
      var(--shadow-md),
      0 0 var(--space-5) color-mix(in srgb, var(--accent) 20%, transparent);
    backdrop-filter: blur(0.6rem);
    animation: toast-fade var(--duration) ease forwards;
  }

  .toast:has(.toast-title) {
    border-radius: var(--radius-lg);
    align-items: flex-start;
    padding: var(--space-3) var(--space-5);
  }

  .toast-icon {
    width: var(--text-lg);
    height: var(--text-lg);
    flex-shrink: 0;
    filter: drop-shadow(0 0 var(--space-1) color-mix(in srgb, var(--accent) 50%, transparent));
  }

  .toast-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .toast-title {
    font-size: var(--text-md);
    line-height: 1.2;
    margin-bottom: 0.15rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .toast-message {
    line-height: 1.4;
  }

  @keyframes toast-fade {
    0% {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    5% {
      opacity: 1;
      transform: translateY(0);
    }
    85% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
  }

  @media (max-width: 768px) {
    .toast {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-xs);
    }
  }
</style>
