<script lang="ts">
  import { onMount } from "svelte";
  import { t } from '$lib/stores/i18n.svelte';
  import { fly } from 'svelte/transition';

  let showPopup = $state(false);
  const DISCLOSURE_KEY = "cookieDisclosureDismissed";
  
  function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }
  
  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
  
  function handleGotIt() {
    setCookie(DISCLOSURE_KEY, "true", 365);
    try {
      localStorage.setItem(DISCLOSURE_KEY, "true");
    } catch (e) {
      // Ignore localStorage errors
    }
    showPopup = false;
  }
  
  function handleDismiss() {
    showPopup = false;
  }
  
  onMount(() => {
    setTimeout(() => {
      const isDismissedCookie = getCookie(DISCLOSURE_KEY) === "true";
      let isDismissedLocal = false;
      try {
        isDismissedLocal = localStorage.getItem(DISCLOSURE_KEY) === "true";
      } catch (e) {}

      if (!isDismissedCookie && !isDismissedLocal) {
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
    bottom: 1.5rem;
    right: 1.5rem;
    width: min(22rem, calc(100vw - 3rem));
    background-color: #131615;
    color: #f65901;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid rgba(246, 89, 1, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    z-index: 2000;
  }

  .close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: #f65901;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    padding: 0.25rem;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 1;
  }

  .title {
    user-select: none;
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-family: 'Letric';
    line-height: 1.1;
  }

  .body {
    user-select: none;
    margin: 0 0 1.25rem;
    font-size: 0.9rem;
    line-height: 1.5;
    font-family: 'Redwing';
    font-weight: 300;
  }

  .got-it-btn {
    user-select: none;
    width: 100%;
    background-color: #0f1010;
    color: #f65901;
    border: 1px solid #f65901;
    padding: 0.75rem;
    border-radius: 0.75rem;
    cursor: pointer;
    font-size: 1rem;
    font-family: 'Redwing';
    transition: all 0.2s;
  }

  .got-it-btn:hover {
    background-color: #f65901;
    color: #0f1010;
  }

  /* Ensure it looks good on mobile too */
  @media (max-width: 600px) {
    .disclosure-box {
      bottom: 1rem;
      right: 1rem;
      left: 1rem;
      width: auto;
    }
  }
</style>
