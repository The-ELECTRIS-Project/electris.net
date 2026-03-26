<script lang="ts">
  import { onMount } from 'svelte';
  import { t, i18nState } from '$lib/stores/i18n.svelte';
  import { useHoverConfig, type HoverConfig } from '$lib/stores/hoverConfig.svelte';

  let isPageArabic = $derived(i18nState.currentLocale === 'ar');

  const hoverConfigs: HoverConfig[] = [
    {
      type: [ 'a' ],
      selectors: ['.creator-link'],
      className: 'hovered-word-wrap',
      requireAllSelectors: false,
      lockPosition: true,
      wrapText: {
        sentences: true
      }
    },
    {
      selectors: ['.progress-text'],
      className: 'hovered-word-wrap',
      lockPosition: false,
      wrapText: {
        sentences: true,
        ignoreCharacters: true,
        ignorePunctuation: true
      }
    }
  ];

  useHoverConfig(hoverConfigs);

  onMount(() => {
    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };

    setTimeout(cursorReset, 10);
  });
</script>

<svelte:head>
  <title>ELECTRIS</title>
</svelte:head>

<div>
  <div class="hero">
    <h1>{t('site.title')}</h1>
    <p>{t('site.slogan')}</p>
  </div>

  <div class="TCS">
    <div class="construction-icon">
      <div class="gear gear-1"></div>
      <div class="gear gear-2"></div>
      <div class="sparks">
        <div class="spark spark-1"></div>
        <div class="spark spark-2"></div>
        <div class="spark spark-3"></div>
      </div>
    </div>
    <div class="tcs-content">
      <h1><span class="glitch" data-text="{t('update.title')}">{t('update.title')}</span></h1>
      <p>{t('update.progress.title', 'Due to not meeting the')} <a href="/about/creator-standard" class="creator-link" class:arabic={isPageArabic}><u>{t('update.progress.title.link')}</u></a></p>
      <div class="progress-container">
        <span class="progress-text">{t('update.progress.undertitle')}</span>
        <div class="progress-bar">
          <div class="progress-fill"></div>
          <div class="electric-spark electric-1"></div>
          <div class="electric-spark electric-2"></div>
          <div class="electric-spark electric-3"></div>
          <div class="electric-bolt"></div>
        </div>
      </div>
    </div>
  </div>
</div>
  
<style>
  .hero {
    min-height: 5vmin;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 7vmin;
    text-align: center;
  }

  .hero h1 {
    font-family: 'Letric';
    font-size: 4rem;
    margin: 0;
  }

  .hero p {
    font-family: sans-serif;
    font-size: 1.5rem;
    margin-top: 1vmin;
    max-width: 80%;
  }

  .TCS {
    min-height: 70vmin;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 4vmin 2vmin;
    position: relative;
    overflow: hidden;
  }

  .TCS::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: sweep 4s ease-in-out infinite;
    pointer-events: none;
  }

  .construction-icon {
    position: relative;
    margin-bottom: 3vmin;
    width: 9vmin;
    height: 8vmin;
  }

  .gear {
    position: absolute;
    border-radius: 50%;
    animation: rotate 3s linear infinite;
  }

  .gear::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: 50%;
  }

  .gear-1 {
    width: 6vmin;
    height: 6vmin;
    top: 0;
    left: 1vmin;
  }

  .gear-2 {
    width: 4vmin;
    height: 4vmin;
    top: 2vmin;
    right: 0;
    animation-direction: reverse;
    animation-duration: 2s;
  }

  .sparks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .spark {
    position: absolute;
    width: 0.4vmin;
    height: 0.4vmin;
    background: #ff6811;
    border-radius: 50%;
    animation: sparkle 2s ease-in-out infinite;
  }

  .spark-1 {
    top: 20%;
    left: 80%;
    animation-delay: 0s;
  }

  .spark-2 {
    top: 70%;
    left: 10%;
    animation-delay: 0.7s;
  }

  .spark-3 {
    top: 10%;
    left: 30%;
    animation-delay: 1.4s;
  }

  .tcs-content {
    position: relative;
    z-index: 2;
  }

  .TCS h1 {
    font-family: 'Letric';
    font-size: 2.8rem;
    margin: 0 0 2vmin 0;
    position: relative;
    word-break: keep-all;
    overflow-wrap: normal;
  }

  .glitch {
    position: relative;
    animation: glitch 3s ease-in-out infinite;
    text-shadow: 0.1vmin 0.1vmin 0.2vmin rgba(246, 89, 1, 0.3);
    display: inline-block;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.7;
  }

  .glitch::before {
    animation: glitch-1 3s ease-in-out infinite;
    color: #ff3300;
    z-index: -1;
  }

  .glitch::after {
    animation: glitch-2 3s ease-in-out infinite;
    color: #0066ff;
    z-index: -2;
  }

  .TCS p {
    font-family: 'Redwing';
    font-size: 1.4rem;
    margin-bottom: 3vmin;
    font-weight: 400;
  }

  .creator-link {
    color: #ff6811;
    position: relative;
    transition: all 0.3s ease;
  }

  .creator-link::after {
    content: '';
    position: absolute;
    bottom: 0.1vmin;
    left: 0;
    width: 0;
    height: 0.2vmin;
    background: linear-gradient(90deg, #f65901, #ff6811);
    transition: width 0.3s ease;
  }

  .creator-link.arabic::after {
    left: auto;
    right: 0;
  }

  .creator-link:hover::after {
    width: 100%;
  }

  .progress-container {
    position: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50vmin;
    max-width: 90vmin;
    margin: 0 auto;
    position: relative;
  }

  .progress-text {
    font-family: 'Redwing';
    font-size: 1rem;
    font-weight: 300;
    color: rgba(246, 89, 1, 0.9);
    animation: fade 2s ease-in-out infinite;
  }

  .progress-bar {
    position: relative;
    width: 100%;
    height: 1vmin;
    background: rgba(246, 89, 1, 0.2);
    border-radius: 0.5vmin;
    overflow: hidden;
    box-shadow: 0 0 1vmin rgba(246, 89, 1, 0.3);
    margin-top: 1vmin;
  }

  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 65%;
    background: linear-gradient(90deg, #f65901, #ff6811, #f65901);
    border-radius: 0.5vmin;
    animation: progress-pulse 3s ease-in-out infinite;
    box-shadow: 0 0 0.5vmin rgba(246, 89, 1, 0.8);
  }

  .electric-spark {
    position: absolute;
    width: 0.2vmin;
    height: 0.2vmin;
    background: #00ffff;
    border-radius: 50%;
    animation: electric-sparkle 1.5s ease-in-out infinite;
    box-shadow: 0 0 0.3vmin #00ffff;
  }

  .electric-1 {
    top: 20%;
    left: 25%;
    animation-delay: 0s;
  }

  .electric-2 {
    top: 70%;
    left: 60%;
    animation-delay: 0.5s;
  }

  .electric-3 {
    top: 40%;
    left: 80%;
    animation-delay: 1s;
  }

  .electric-bolt {
    position: absolute;
    top: 50%;
    left: 30%;
    width: 0.1vmin;
    height: 0.8vmin;
    background: linear-gradient(to bottom, transparent, #00ffff, transparent);
    transform: translateY(-50%) rotate(15deg);
    animation: bolt-flash 2s ease-in-out infinite;
    box-shadow: 0 0 0.3vmin #00ffff;
  }

  .electric-bolt::before {
    content: '';
    position: absolute;
    top: 0;
    left: -0.05vmin;
    width: 0.2vmin;
    height: 0.3vmin;
    background: #00ffff;
    transform: rotate(-30deg);
  }

  .electric-bolt::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -0.05vmin;
    width: 0.2vmin;
    height: 0.3vmin;
    background: #00ffff;
    transform: rotate(30deg);
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1.5); }
  }

  @keyframes sweep {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  @keyframes glitch {
    0%, 100% { transform: translate(0); }
    10% { transform: translate(-0.1vmin, 0.1vmin); }
    20% { transform: translate(-0.1vmin, -0.1vmin); }
    30% { transform: translate(0.1vmin, 0.1vmin); }
    40% { transform: translate(0.1vmin, -0.1vmin); }
    50% { transform: translate(0); }
    60% { transform: translate(-0.05vmin, 0.05vmin); }
    70% { transform: translate(0.05vmin, -0.05vmin); }
    80% { transform: translate(0); }
    90% { transform: translate(-0.1vmin, 0.1vmin); }
  }

  @keyframes glitch-1 {
    0%, 100% { transform: translate(0); opacity: 0.7; }
    10% { transform: translate(-0.2vmin, 0.2vmin); opacity: 0.5; }
    20% { transform: translate(-0.2vmin, -0.2vmin); opacity: 0.5; }
    30% { transform: translate(0.2vmin, 0.2vmin); opacity: 0.5; }
    40% { transform: translate(0.2vmin, -0.2vmin); opacity: 0.5; }
    50% { transform: translate(0); opacity: 0.7; }
    60% { transform: translate(-0.1vmin, 0.1vmin); opacity: 0.6; }
    70% { transform: translate(0.1vmin, -0.1vmin); opacity: 0.6; }
    80% { transform: translate(0); opacity: 0.7; }
    90% { transform: translate(-0.2vmin, 0.2vmin); opacity: 0.5; }
  }

  @keyframes glitch-2 {
    0%, 100% { transform: translate(0); opacity: 0.7; }
    10% { transform: translate(0.2vmin, -0.2vmin); opacity: 0.5; }
    20% { transform: translate(0.2vmin, 0.2vmin); opacity: 0.5; }
    30% { transform: translate(-0.2vmin, -0.2vmin); opacity: 0.5; }
    40% { transform: translate(-0.2vmin, 0.2vmin); opacity: 0.5; }
    50% { transform: translate(0); opacity: 0.7; }
    60% { transform: translate(0.1vmin, -0.1vmin); opacity: 0.6; }
    70% { transform: translate(-0.1vmin, 0.1vmin); opacity: 0.6; }
    80% { transform: translate(0); opacity: 0.7; }
    90% { transform: translate(0.2vmin, -0.2vmin); opacity: 0.5; }
  }

  @keyframes progress-pulse {
    0%, 100% { opacity: 0.8; transform: scaleX(1); }
    50% { opacity: 1; transform: scaleX(1.05); }
  }

  @keyframes fade {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  @keyframes electric-sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    20% { opacity: 1; transform: scale(1); }
    40% { opacity: 0.5; transform: scale(1.5); }
    60% { opacity: 1; transform: scale(0.8); }
    80% { opacity: 0.3; transform: scale(1.2); }
  }

  @keyframes bolt-flash {
    0%, 90%, 100% { opacity: 0; }
    5%, 15% { opacity: 1; }
    10% { opacity: 0.5; }
  }
</style>
