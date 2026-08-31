<script lang="ts">
  import { onMount } from 'svelte';
  import { t, i18nState } from '$lib/state/i18n.svelte';
  import { useHoverConfig, type HoverConfig } from '$lib/state/hoverConfig.svelte';
  import { modsState } from '$lib/state/mods.svelte';
  import PinsGrid from './components/ui/PinsGrid.svelte';
  import Customize from './components/ui/Customize.svelte';
  import Search from './components/ui/Search.svelte';

  let currentTime = $state(new Date());
  let i18nInitialized = $state(false);

  let showQuickPins = $derived(modsState.config.newHome.showQuickPins);
  let showSearchBar = $derived(modsState.config.newHome.showSearchBar);

  const hoverConfigs: HoverConfig[] = [
    {
      selectors: ['.newhome-search', '.search-wrapper'],
      className: 'hovered-new-search',
      requireAllSelectors: true,
      lockPosition: true,
      trackingTarget: '.search-wrapper'
    }
  ];

  useHoverConfig(hoverConfigs);

  onMount(() => {
    modsState.init();
    i18nInitialized = true;
    const orbitReset = () => {
      const orbit = document.querySelector('.circle');
      if (orbit) {
        orbit.className = "circle";
      }
    };

    setTimeout(orbitReset, 10);

    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  function formatTime(date: Date, locale: string): string {
    if (!i18nInitialized) return date.toLocaleTimeString();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    return date.toLocaleTimeString(locale, timeOptions);
  }

  function formatDate(date: Date, locale: string): string {
    if (!i18nInitialized) return date.toLocaleDateString();

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString(locale, dateOptions);
  }
</script>

<svelte:head>
  <title>NewHome | ELECTRIS</title>
  <meta name="description" content="A New Home for your browser" />
</svelte:head>

<div class="newhome-container">
  <div class="welcome-section">
    <h1 class="newhome-title">
      <span class="title-main">{t('site.title')}</span>
      <span class="newhome-subtitle">{t('site.newhome.title')}</span>
    </h1>

    <div class="time-display">
      <div class="time">{formatTime(currentTime, i18nState.currentLocale)}</div>
      <div class="date">{formatDate(currentTime, i18nState.currentLocale)}</div>
    </div>
  </div>

  {#if showSearchBar}
    <Search/>
  {/if}

  {#if showQuickPins}
    <h2 class="section-title wrap-sentence">
      {t('newhome.pins.title')}
    </h2>

    <PinsGrid/>
  {/if}

  <Customize/>
</div>

<style>
  .newhome-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
    max-width: var(--layout-max);
    margin: 0 auto;
    position: relative;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: var(--space-7);
    position: relative;
    z-index: var(--z-raised);
  }

  .newhome-title {
    font-size: var(--display-md);
    font-weight: 700;
    margin-bottom: var(--space-6);
    position: relative;
    cursor: default;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .title-main {
    font-family: var(--font-display);
    color: var(--accent);
    text-shadow: 0 0 var(--space-5) color-mix(in srgb, var(--accent) 30%, transparent);
    display: block;
  }

  .newhome-subtitle {
    font-family: var(--font-brand);
    font-size: 1.15em;
    display: block;
    background: linear-gradient(to left, var(--brand-electris) 10%, var(--brand-electro) 25%);
    background-size: 500% 100%;
    background-position: 80% 0%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-text-pulse 3s ease-in-out infinite;
    position: relative;
    top: -1.85rem;
  }

  .newhome-subtitle:hover {
    animation: gradient-text-pulse-intense 1.5s ease-in-out infinite;
  }

  @keyframes gradient-text-pulse {
    0%, 100% {
      background-position: 90% 0%;
      background-size: 400% 100%;
    }
    50% {
      background-position: 60% 0%;
      background-size: 450% 100%;
    }
  }

  @keyframes gradient-text-pulse-intense {
    0%, 100% {
      background-position: 85% 0%;
      background-size: 350% 100%;
    }
    25% {
      background-position: 45% 0%;
      background-size: 400% 100%;
    }
    50% {
      background-position: 30% 0%;
      background-size: 450% 100%;
    }
    75% {
      background-position: 50% 0%;
      background-size: 380% 100%;
    }
  }

  .time-display {
    margin-bottom: var(--space-6);
    position: relative;
  }

  .time {
    font-size: var(--display-sm);
    font-weight: 300;
    margin-bottom: var(--space-2);
    font-family: var(--font-body);
  }

  .date {
    font-size: var(--text-md);
    opacity: 0.7;
    font-family: var(--font-body);
  }

  .section-title {
    text-align: center;
    font-size: var(--text-2xl);
    margin-bottom: var(--space-6);
    font-family: var(--font-display);
    position: relative;
  }

  @media (max-width: 900px) {
    .newhome-container {
      max-width: 48rem;
    }

    .newhome-subtitle {
      top: -1rem;
    }
  }

  @media (max-width: 560px) {
    .welcome-section {
      margin-bottom: var(--space-6);
    }

    .newhome-subtitle {
      top: -0.4rem;
    }

    .section-title {
      margin-bottom: var(--space-5);
    }
  }
</style>
