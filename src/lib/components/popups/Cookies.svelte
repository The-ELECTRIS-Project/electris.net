<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import { modsState } from '$lib/state/mods.svelte';
  import { fly } from 'svelte/transition';

  let showPopup = $state(false);
  
  function handleGotIt() {
    modsState.updateSetting('site', 'cookieDisclosureDismissed', true);
    showPopup = false;
  }
  
  function handleDismiss() {
    showPopup = false;
  }
  
  onMount(() => {
    setTimeout(() => {
      if (!modsState.config.site.cookieDisclosureDismissed) {
        showPopup = true;
      }
    }, 800);
  });
</script>

{#if showPopup}
  <div class="disclosure-box" transition:fly={{ y: 50, duration: 400 }}>
    <button class="close-btn" onclick={handleDismiss} aria-label="Dismiss">×</button>
    <div class="content">
      <h3 class="title">🍪 {t('notice.cookie.title', 'Cookie Disclosure')}</h3>
      <p class="body">
        {t('notice.cookie.body', 'This website only uses cookies for absolutely necessary functionality and avoids tracking cookies at all costs.')}
      </p>
      <button class="got-it-btn" onclick={handleGotIt}>
        {t('notice.cookie.ok', 'Got it')}
      </button>
    </div>
  </div>
{/if}

<style>
  .disclosure-box {
    position: fixed;
    bottom: var(--space-5);
    right: var(--space-5);
    width: min(22rem, calc(100vw - 3rem));
    background-color: var(--surface-nav);
    color: var(--accent);
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-popup);
  }

  .close-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-3);
    background: none;
    border: none;
    color: var(--accent);
    font-size: var(--text-xl);
    cursor: pointer;
    line-height: 1;
    padding: var(--space-1);
    opacity: 0.7;
    transition: opacity var(--duration-normal) var(--ease-out);
  }

  .close-btn:hover {
    opacity: 1;
  }

  .title {
    user-select: none;
    margin: 0 0 var(--space-2);
    font-size: var(--text-xl);
    font-family: var(--font-display);
    line-height: 1.1;
  }

  .body {
    user-select: none;
    margin: 0 0 var(--space-4);
    font-size: var(--text-sm);
    line-height: 1.5;
    font-family: var(--font-body);
    font-weight: 300;
  }

  .got-it-btn {
    user-select: none;
    width: 100%;
    background-color: var(--surface-page);
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--text-base);
    font-family: var(--font-body);
    transition: var(--transition-colors);
  }

  .got-it-btn:hover {
    background-color: var(--accent);
    color: var(--surface-page);
  }

  @media (max-width: 600px) {
    .disclosure-box {
      bottom: var(--space-4);
      right: var(--space-4);
      left: var(--space-4);
      width: auto;
    }
  }
</style>
