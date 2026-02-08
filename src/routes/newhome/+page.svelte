<script lang="ts">
  import { onMount } from 'svelte';
  import { t, currentLocale, initializeI18n } from '$lib/stores/i18n';
  import { useHoverConfig, type HoverConfig } from '$lib/stores/hoverConfig';
  import { mods } from '$lib/stores/customization';
  import PinsGrid from '$lib/UI/components/PinsGrid.svelte';
  import Customize from '$lib/UI/components/Customize.svelte';
  import Search from '$lib/UI/components/Search.svelte';
  
  let currentTime = new Date();
  let i18nInitialized = false;

  // Reactive variables for display toggles
  $: showQuickPins = $mods.showQuickPins;
  $: showSearchBar = $mods.showSearchBar;

  const hoverConfigs: HoverConfig[] = [
    {
      selectors: ['.newhome-search', '.search-wrapper'],
      className: 'hovered-new-search',
      requireAllSelectors: true,
      lockPosition: true,
      wrapText: {
        words: false,
        sentences: false,
        ignorePunctuation: false,
        ignoreCharacters: false
      }
    }
  ];

  useHoverConfig(hoverConfigs);
  
  onMount(() => {
    (async () => {
      // Initialize mods first
      mods.init();
      
      await initializeI18n();
      i18nInitialized = true;
    })();
    
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };
    setTimeout(cursorReset, 10);

    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    
    const createFloatingOrb = () => {
      const orb = document.createElement('div');
      orb.className = 'floating-orb';
      orb.style.left = Math.random() * 100 + '%';
      orb.style.animationDuration = (8 + Math.random() * 4) + 's';
      orb.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(orb);

      setTimeout(() => {
        orb.remove();
      }, 12000);
    };

    const orbInterval = setInterval(createFloatingOrb, 8000 + Math.random() * 5000);

    const addGlitchEffect = () => {
      const title = document.querySelector('.newhome-subtitle');
      if (title && Math.random() < 0.15) {
        title.classList.add('glitch-pulse');
        setTimeout(() => {
          title.classList.remove('glitch-pulse');
        }, 300);
      }
    };

    const glitchInterval = setInterval(addGlitchEffect, 6000 + Math.random() * 8000);

    return () => {
      clearInterval(interval);
      clearInterval(orbInterval);
      clearInterval(glitchInterval);
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
  <div class="ambient-dots">
    <div class="ambient-dot dot-1"></div>
    <div class="ambient-dot dot-2"></div>
    <div class="ambient-dot dot-3"></div>
  </div>
  
  <div class="welcome-section">
    <h1 class="newhome-title">
      <span class="title-main">{$t('site.title', 'ELECTRIS')}</span>
      <span class="newhome-subtitle">{$t('site.newhome.version', 'NewHome')}</span>
    </h1>
    
    <div class="time-display">
      <div class="time">{formatTime(currentTime, $currentLocale)}</div>
      <div class="date">{formatDate(currentTime, $currentLocale)}</div>
    </div>
  </div>

  {#if showSearchBar}
    <Search/>
  {/if}
  
  {#if showQuickPins}
    <h2 class="section-title">
      {$t('newhome.pins.title', 'Quick Pins')}
    </h2>

    <PinsGrid/>
  {/if}
  
  <Customize/>
</div>

<style>
  :global(.floating-orb) {
    position: fixed;
    width: 4px;
    height: 4px;
    background: rgba(246, 89, 1, 0.6);
    border-radius: 50%;
    opacity: 0;
    top: 100vh;
    z-index: 1;
    animation: float-up 10s linear forwards;
    pointer-events: none;
    box-shadow: 0 0 8px rgba(246, 89, 1, 0.4);
  }

  @keyframes float-up {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0);
    }
    10% {
      opacity: 0.8;
    }
    90% {
      opacity: 0.8;
      transform: translateY(-100vh) translateX(20px);
    }
    100% {
      opacity: 0;
      transform: translateY(-100vh) translateX(40px);
    }
  }

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

  .ambient-dots {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
  }

  .ambient-dot {
    position: absolute;
    width: 0.2vh;
    height: 0.2vh;
    background: rgba(246, 89, 1, 0.3);
    border-radius: 50%;
    animation: ambient-pulse 4s ease-in-out infinite;
  }

  .dot-1 {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }

  .dot-2 {
    top: 60%;
    right: 15%;
    animation-delay: 1.5s;
  }

  .dot-3 {
    bottom: 30%;
    left: 80%;
    animation-delay: 3s;
  }

  @keyframes ambient-pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(2); }
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
    top: -2.5vh;
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

  @keyframes subtitle-glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-1px, 1px); }
    40% { transform: translate(-1px, -1px); }
    60% { transform: translate(1px, 1px); }
    80% { transform: translate(1px, -1px); }
    100% { transform: translate(0); }
  }
  
  .time-display {
    margin-bottom: 2rem;
    position: relative;
  }
  
  .time {
    font-size: 3rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
    font-family: 'Redwing', sans-serif;
  }
  
  .date {
    font-size: 1.1rem;
    opacity: 0.7;
    font-family: 'Redwing', sans-serif;
  }

  .section-title {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    font-family: 'Letric';
    position: relative;
  }
  
  @media (max-width: 73.4px) {
    .newhome-container {
      padding: 5rem 1rem 4rem;
    }

    .newhome-title {
      font-size: 2.8rem;
    }
    
    .time {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 48vh) {
    .newhome-container {
      padding: 4rem 1rem 4rem;
    }

    .newhome-title {
      font-size: 2.2rem;
    }

    .time {
      font-size: 2rem;
    }

    .section-title {
      font-size: 1.4rem;
    }
  }
</style>