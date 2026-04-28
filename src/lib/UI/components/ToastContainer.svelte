<script lang="ts">
  import { toastState } from '$lib/stores/toast.svelte';
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
    top: calc(env(safe-area-inset-top, 0px) + 4.5rem);
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    pointer-events: none;
    width: max-content;
    max-width: 90vw;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.6rem 1.4rem;
    border-radius: 999px;
    background: rgba(20, 8, 0, 0.75);
    border: 0.1vmin solid rgba(246, 89, 1, 0.45);
    color: rgba(246, 89, 1, 0.95);
    font-family: 'Redwing';
    font-size: 0.95rem;
    letter-spacing: 0.01em;
    box-shadow: 0 0.8rem 1.6rem rgba(0, 0, 0, 0.35), 0 0 1.4rem rgba(246, 89, 1, 0.2);
    backdrop-filter: blur(0.6rem);
    animation: toast-fade var(--duration) ease forwards;
  }

  .toast:has(.toast-title) {
    border-radius: 1rem;
    align-items: flex-start;
    padding: 0.8rem 1.4rem;
  }

  .toast-icon {
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;
    filter: drop-shadow(0 0 0.2rem rgba(246, 89, 1, 0.5));
  }

  .toast-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .toast-title {
    font-size: 1.1rem;
    line-height: 1.2;
    margin-bottom: 0.15rem;
    color: #fff;
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
    .toast-container {
      top: calc(env(safe-area-inset-top, 0px) + 4rem);
    }
    
    .toast {
      padding: 0.5rem 1.2rem;
      font-size: 0.9rem;
    }
  }
</style>
