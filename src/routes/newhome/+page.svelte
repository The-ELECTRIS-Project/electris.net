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
    padding: 6rem 2rem 4rem;
    max-width: 120vh;
    margin: 0 auto;
    position: relative;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
    z-index: 2;
  }

  .newhome-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    position: relative;
    cursor: default;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .title-main {
    font-family: 'Letric';
    color: var(--accent-color, #ff6811);
    text-shadow: 0 0 20px rgba(246, 89, 1, 0.3);
    display: block;
  }

  .newhome-subtitle {
    font-family: 'Tourner';
    font-size: 1.15em;
    display: block;
    background: linear-gradient(to left,
      #764ba2 10%,
      #667eea 25%,
      #667eea 40%,
      #667eea 100%
    );
    background-size: 500% 100%;
    background-position: 80% 0%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-text-pulse 3s ease-in-out infinite;
    position: relative;
    top: -2.5vmin;
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
    margin-bottom: 2rem;
    position: relative;
  }

  .time {
    font-size: 3rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
    font-family: 'Redwing', Aileron;
  }

  .date {
    font-size: 1.1rem;
    opacity: 0.7;
    font-family: 'Redwing', Aileron;
  }

  .section-title {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    font-family: 'Letric';
    position: relative;
  }

  @media (max-width: 900px) {
    .newhome-container {
      padding: 6.5rem 1.5rem 5rem;
      max-width: 48rem;
    }

    .newhome-title {
      font-size: clamp(3rem, 9vw, 4.2rem);
    }

    .newhome-subtitle {
      top: -1rem;
    }

    .time {
      font-size: clamp(2.6rem, 10vw, 3.3rem);
    }

    .date {
      font-size: 1.05rem;
    }
  }

  @media (max-width: 560px) {
    .newhome-container {
      padding: 5.75rem 1rem 5rem;
    }

    .welcome-section {
      margin-bottom: 2.25rem;
    }

    .newhome-title {
      font-size: clamp(2.4rem, 12vw, 3.2rem);
      gap: 0.35rem;
    }

    .newhome-subtitle {
      top: -0.4rem;
    }

    .time {
      font-size: clamp(2.2rem, 13vw, 2.8rem);
    }

    .date {
      font-size: 1rem;
      line-height: 1.5;
    }

    .section-title {
      font-size: 1.7rem;
      margin-bottom: 1.5rem;
    }
  }
</style>
