<script lang="ts">
    import { onMount } from "svelte";
    import { t } from '$lib/stores/i18n.svelte';

    let showPopup = $state(false);
    let dontShowAgain = $state(false);
    
    function setCookie(name: string, value: string, days: number) {
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }
    
    function getCookie(name: string): string | null {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }
    
    function dismissPopup() {
      if (dontShowAgain) setCookie("mobilePopupDismissed", "true", 365);
      showPopup = false;
    }
    
    onMount(() => {
      if (getCookie("mobilePopupDismissed") === "true") return;
      
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
            <input type="checkbox" bind:checked={dontShowAgain}> {t('notice.mobile.never', "Don't show again")}
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
      padding: 0.75rem;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .mobile-popup {
      background-color: #131615;
      color: #f65901;
      width: min(19rem, calc(100vw - 1.5rem));
      padding: 1rem;
      border-radius: 1rem;
      max-width: 100%;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      animation: fadeInGrow 0.3s ease;
    }

    .mobile-popup-title {
      user-select: none;
      margin: 0 0 0.65rem;
      font-size: 1.55rem;
      line-height: 1.05;
      font-family: 'Letric';
    }

    .mobile-popup-body {
      user-select: none;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
      font-family: 'Redwing';
      font-weight: 300;
      padding-bottom: 0.75rem;
      padding-top: 0.2rem;
    }

    .mobile-popup label {
      user-select: none;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      line-height: 1.35;
    }

    .mobile-popup button {
      user-select: none;
      min-height: 2.5rem;
      font-size: 0.95rem;
    }

    .popup-controls {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    button {
      background-color: #0f1010;
      color: #f65901;
      border: 1px solid #f65901;
      padding: 0.65rem 0.95rem;
      border-radius: 0.75rem;
      cursor: pointer;
    }

    input[type="checkbox"] {
      width: 0.95rem;
      height: 0.95rem;
      margin: 0;
      accent-color: #f65901;
      flex: 0 0 auto;
    }
    
    @keyframes fadeInGrow {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
  </style>
