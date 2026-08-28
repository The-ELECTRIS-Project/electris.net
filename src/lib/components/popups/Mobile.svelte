<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import { modsState } from '$lib/state/mods.svelte';

  let showPopup = $state(false);
  let dontShowAgain = $state(false);
  
  function dismissPopup() {
    if (dontShowAgain) {
      modsState.updateSetting('site', 'mobilePopupDismissed', true);
    }
    showPopup = false;
  }
  
  onMount(() => {
    if (modsState.config.site.mobilePopupDismissed) return;
    
    const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
    const isMobileLike = !hasFinePointer && (navigator.maxTouchPoints > 0 ||
      window.matchMedia('(max-width: 900px), (any-pointer: coarse)').matches);

    if (isMobileLike) showPopup = true;
  });
</script>
{#if showPopup}
  <div class="mobile-popup-backdrop">
    <div class="mobile-popup">
      <h2 class="mobile-popup-title">{t('notice.mobile.title', 'Mobile Notice!')}</h2>
      <p class="mobile-popup-body">{t('notice.mobile.body', 'This site works on mobile, but things may look out of place or be hard to read. Please check us out on a laptop or desktop with a mouse or trackpad.')}</p>
      <div class="popup-controls">
        <label>
          <input type="checkbox" bind:checked={dontShowAgain}> {t('notice.mobile.never', 'Don\'t show again')}
        </label>
        <button onclick={dismissPopup}>{t('notice.mobile.ok', 'Got it!')}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .mobile-popup-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: var(--space-3);
    background-color: var(--scrim-page);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-popup);
  }

  .mobile-popup {
    background-color: var(--surface-nav);
    color: var(--accent);
    width: min(19rem, calc(100vw - 1.5rem));
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    max-width: 100%;
    box-shadow: var(--shadow-lg);
    animation: fadeInGrow var(--duration-slow) var(--ease-out);
  }

  .mobile-popup-title {
    user-select: none;
    margin: 0 0 var(--space-3);
    font-size: var(--text-xl);
    line-height: 1.05;
    font-family: var(--font-display);
  }

  .mobile-popup-body {
    user-select: none;
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.5;
    font-family: var(--font-body);
    font-weight: 300;
    padding-bottom: var(--space-3);
    padding-top: var(--space-1);
  }

  .mobile-popup label {
    user-select: none;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-2xs);
    line-height: 1.35;
  }

  .mobile-popup button {
    user-select: none;
    min-height: var(--touch-target-size);
    font-size: var(--text-sm);
  }

  .popup-controls {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }

  button {
    background-color: var(--surface-page);
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-colors);
  }

  button:hover {
    background-color: var(--accent);
    color: var(--surface-page);
  }

  input[type="checkbox"] {
    width: 0.95rem;
    height: 0.95rem;
    margin: 0;
    accent-color: var(--accent);
    flex: 0 0 auto;
  }

  @keyframes fadeInGrow {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
