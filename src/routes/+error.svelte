<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let error = $derived(page.error);
  let status = $derived(page.status);

  onMount(() => {
    const orbitReset = () => {
      const orbit = document.querySelector('.circle');
      if (orbit) {
        orbit.className = "circle";
      }
    };

    setTimeout(orbitReset, 10);
  });

  const goBack = () => {
    history.back();
  };
</script>

<svelte:head>
  <title>{t('error.title', 'Error')} {status} | ELECTRIS</title>
</svelte:head>

<div class="error-page">
  <div class="error-container">
    <div class="error-icon">
      <div class="broken-gear gear-1"></div>
      <div class="broken-gear gear-2"></div>
      <div class="error-sparks">
        <div class="error-spark spark-1"></div>
        <div class="error-spark spark-2"></div>
        <div class="error-spark spark-3"></div>
        <div class="error-spark spark-4"></div>
      </div>
      <div class="crack-line"></div>
    </div>

    <div class="error-content">
      <h1>
        <span class="error-text-glitch" data-text="ERROR">ERROR</span>
        <span class="status-glitch" data-text="{status}"> {status}</span>
      </h1>

      {#if status === 404}
        <p class="error-message">{t('error.404.message', "That page isn't here.")}</p>
        <p class="error-submessage">
          {t('error.404.detail', 'Either it moved, or it never existed in the first place.')}
        </p>
      {:else}
        <p class="error-message">{t('error.generic.message', 'Something broke.')}</p>
        <p class="error-submessage">
          {error?.message || t('error.generic.detail', 'No idea what, which is the annoying part.')}
        </p>
      {/if}

      <div class="error-actions">
        <Button href="/" class="return-button">
          <span class="button-text">{t('error.action.home', 'To the home page')}</span>
          <div class="button-spark"></div>
        </Button>
        <Button onclick={goBack} class="back-button">
          <span class="button-text">{t('error.action.back', 'Go back')}</span>
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  .error-page {
    /* The glitch reads as three offset hues; these keep that while following the scheme. */
    --error-damage: color-mix(in srgb, var(--accent) 50%, #ff2200);
    --error-glitch-a: color-mix(in srgb, var(--accent) 78%, #ffcc00);
    --error-glitch-b: color-mix(in srgb, var(--accent) 35%, #ff0044);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: var(--space-7) var(--space-5);
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .error-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent 30%, color-mix(in srgb, var(--accent) 3%, transparent) 50%, transparent 70%);
    animation: error-sweep 5s ease-in-out infinite;
    pointer-events: none;
  }

  .error-container {
    position: relative;
    z-index: var(--z-raised);
    max-width: var(--layout-measure);
  }

  .error-icon {
    position: relative;
    margin: 0 auto var(--space-7);
    width: 7.5rem;
    height: 7.5rem;
  }

  .broken-gear {
    position: absolute;
    border-radius: var(--radius-round);
    border: 3px solid var(--accent);
    animation: broken-rotate 4s ease-in-out infinite;
  }

  .broken-gear::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: var(--radius-round);
    background: radial-gradient(circle, transparent 40%, var(--accent) 42%, var(--accent) 58%, transparent 60%);
  }

  .gear-1 {
    width: 5.25rem;
    height: 5.25rem;
    top: 0;
    left: 1.125rem;
    animation-duration: 3s;
  }

  .gear-2 {
    width: 3.75rem;
    height: 3.75rem;
    top: 1.875rem;
    right: 0;
    animation-direction: reverse;
    animation-duration: 4s;
    opacity: 0.7;
  }

  .crack-line {
    position: absolute;
    top: 2.25rem;
    left: 2.25rem;
    width: var(--space-7);
    height: 2px;
    background: linear-gradient(45deg, transparent, var(--error-damage), transparent);
    transform: rotate(45deg);
    animation: crack-glow 2s ease-in-out infinite;
  }

  .crack-line::before {
    content: '';
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    width: var(--space-5);
    height: 1px;
    background: linear-gradient(45deg, transparent, var(--error-damage), transparent);
    transform: rotate(-30deg);
  }

  .error-sparks {
    position: absolute;
    inset: 0;
  }

  .error-spark {
    position: absolute;
    width: 3px;
    height: 3px;
    background: var(--error-damage);
    border-radius: var(--radius-round);
    animation: error-sparkle 1.5s ease-in-out infinite;
    box-shadow: 0 0 var(--space-1) var(--error-damage);
  }

  .spark-1 {
    top: 10%;
    left: 85%;
    animation-delay: 0s;
  }

  .spark-2 {
    top: 80%;
    left: 15%;
    animation-delay: 0.4s;
  }

  .spark-3 {
    top: 20%;
    left: 20%;
    animation-delay: 0.8s;
  }

  .spark-4 {
    top: 70%;
    left: 80%;
    animation-delay: 1.2s;
  }

  .error-content h1 {
    font-family: var(--font-display);
    font-size: var(--display-sm);
    margin: 0 0 var(--space-5);
    position: relative;
  }

  .error-text-glitch, .status-glitch {
    position: relative;
    animation: error-glitch 2s ease-in-out infinite;
    text-shadow: 1px 1px 2px color-mix(in srgb, var(--error-damage) 30%, transparent);
    display: inline-block;
    color: var(--error-damage);
  }

  .error-text-glitch {
    font-family: var(--font-display);
  }

  .status-glitch {
    font-family: var(--font-body);
    font-weight: 600;
  }

  .error-text-glitch::before,
  .error-text-glitch::after,
  .status-glitch::before,
  .status-glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.6;
  }

  .error-text-glitch::before,
  .status-glitch::before {
    animation: error-glitch-1 2s ease-in-out infinite;
    color: var(--error-glitch-a);
    z-index: -1;
  }

  .error-text-glitch::after,
  .status-glitch::after {
    animation: error-glitch-2 2s ease-in-out infinite;
    color: var(--error-glitch-b);
    z-index: -2;
  }

  .error-message {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    margin-bottom: var(--space-3);
    font-weight: 500;
    color: var(--accent);
  }

  .error-submessage {
    font-family: var(--font-body);
    font-size: var(--text-base);
    margin-bottom: var(--space-7);
    opacity: 0.8;
    font-weight: 300;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    align-items: center;
  }

  .error-actions :global(.return-button),
  .error-actions :global(.back-button) {
    --btn-fill: 10%;
    --btn-fill-hover: 20%;
    --btn-edge: 100%;
    --btn-edge-hover: 100%;
    --btn-raise: translateY(-0.15rem);
    --btn-shadow-hover: 0 0 var(--space-3) color-mix(in srgb, var(--accent) 50%, transparent);
    position: relative;
    min-height: var(--touch-target-size);
    padding: var(--space-3) var(--space-6);
    border-width: 2px;
    color: var(--accent);
    font-family: var(--font-body);
    font-size: var(--text-md);
    font-weight: 500;
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .button-text {
    position: relative;
    z-index: var(--z-raised);
  }

  .button-spark {
    position: absolute;
    top: 50%;
    right: var(--space-3);
    width: 3px;
    height: 3px;
    background: var(--accent);
    border-radius: var(--radius-round);
    transform: translateY(-50%);
    animation: button-spark-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 var(--space-1) var(--accent);
  }

  @media (max-width: 900px), (any-pointer: coarse) {
    .error-page {
      padding: var(--layout-page-top) var(--space-4) var(--space-7);
    }

    .error-container {
      max-width: min(28rem, 100%);
    }

    .error-actions :global(.return-button),
    .error-actions :global(.back-button) {
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
    }
  }

  @keyframes error-sweep {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  @keyframes broken-rotate {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(90deg); }
    50% { transform: rotate(180deg); }
    75% { transform: rotate(270deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes crack-glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; box-shadow: 0 0 var(--space-3) var(--error-damage); }
  }

  @keyframes error-sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    25% { opacity: 1; transform: scale(1.5); }
    50% { opacity: 0.7; transform: scale(1); }
    75% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes error-glitch {
    0%, 100% { transform: translate(0); }
    10% { transform: translate(-1.5px, 1.5px); }
    20% { transform: translate(-1.5px, -1.5px); }
    30% { transform: translate(1.5px, 1.5px); }
    40% { transform: translate(1.5px, -1.5px); }
    50% { transform: translate(0); }
    60% { transform: translate(-1px, 1px); }
    70% { transform: translate(1px, -1px); }
    80% { transform: translate(0); }
    90% { transform: translate(-1.5px, 1.5px); }
  }

  @keyframes error-glitch-1 {
    0%, 100% { transform: translate(0); opacity: 0.6; }
    10% { transform: translate(-3px, 3px); opacity: 0.4; }
    20% { transform: translate(-3px, -3px); opacity: 0.4; }
    30% { transform: translate(3px, 3px); opacity: 0.4; }
    40% { transform: translate(3px, -3px); opacity: 0.4; }
    50% { transform: translate(0); opacity: 0.6; }
    60% { transform: translate(-2px, 2px); opacity: 0.5; }
    70% { transform: translate(2px, -2px); opacity: 0.5; }
    80% { transform: translate(0); opacity: 0.6; }
    90% { transform: translate(-3px, 3px); opacity: 0.4; }
  }

  @keyframes error-glitch-2 {
    0%, 100% { transform: translate(0); opacity: 0.6; }
    10% { transform: translate(3px, -3px); opacity: 0.4; }
    20% { transform: translate(3px, 3px); opacity: 0.4; }
    30% { transform: translate(-3px, -3px); opacity: 0.4; }
    40% { transform: translate(-3px, 3px); opacity: 0.4; }
    50% { transform: translate(0); opacity: 0.6; }
    60% { transform: translate(2px, -2px); opacity: 0.5; }
    70% { transform: translate(-2px, 2px); opacity: 0.5; }
    80% { transform: translate(0); opacity: 0.6; }
    90% { transform: translate(3px, -3px); opacity: 0.4; }
  }

  @keyframes button-spark-pulse {
    0%, 100% { opacity: 0.5; transform: translateY(-50%) scale(1); }
    50% { opacity: 1; transform: translateY(-50%) scale(1.5); }
  }
</style>
