<script lang="ts">
  import { onMount } from 'svelte';
  import { t, i18nState } from '$lib/state/i18n.svelte';
  import T from '$lib/components/ui/T.svelte';

  let isPageArabic = $derived(i18nState.currentLocale === 'ar');
  let isPageJapanese = $derived(i18nState.currentLocale === 'ja-JP');

  const glitchChars = '█▓▒░▄▀▐▌│┤┘┴┬├─┼╋╬╫╪╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌┐└┴┬├─┼';

  interface GlitchTarget {
    node: Text;
    original: string;
    written: string;
  }

  function glitchAction(node: HTMLElement) {
    let isCorrupted = false;
    let corruptInterval: ReturnType<typeof setInterval> | null = null;
    let targets: GlitchTarget[] = [];

    const corruptText = (text: string, intensity: number): string =>
      Array.from(text, char =>
        char !== ' ' && Math.random() < intensity
          ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
          : char
      ).join('');

    const collectTargets = () => {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      targets = [];

      while (walker.nextNode()) {
        const text = walker.currentNode as Text;
        const original = text.nodeValue ?? '';
        targets.push({ node: text, original, written: original });
      }
    };

    // A value that no longer matches what the glitch wrote came from a locale change, so it
    // becomes the new original rather than being overwritten with stale text.
    const corrupt = (intensity: number) => {
      for (const target of targets) {
        if (target.node.nodeValue !== target.written) target.original = target.node.nodeValue ?? '';

        target.written = corruptText(target.original, intensity);
        target.node.nodeValue = target.written;
      }
    };

    const restore = () => {
      for (const target of targets) {
        if (target.node.nodeValue === target.written) target.node.nodeValue = target.original;
      }
    };

    const handleMouseEnter = () => {
      if (isCorrupted) return;

      isCorrupted = true;
      collectTargets();
      let corruptionLevel = 0;

      corruptInterval = setInterval(() => {
        corruptionLevel += 0.01;
        corrupt(Math.min(corruptionLevel, 0.01));

        if (corruptionLevel >= 0.15) {
          setTimeout(() => {
            restore();
            isCorrupted = false;
          }, 100);
          if (corruptInterval !== null) {
            clearInterval(corruptInterval);
            corruptInterval = null;
          }
        }
      }, 50);
    };

    node.addEventListener('mouseenter', handleMouseEnter);

    return {
      destroy() {
        node.removeEventListener('mouseenter', handleMouseEnter);
        if (corruptInterval !== null) clearInterval(corruptInterval);
      }
    };
  }

  onMount(() => {
    const orbitReset = () => {
      const orbit = document.querySelector('.circle');
      if (orbit) {
        orbit.className = "circle";
      }
    };

    setTimeout(orbitReset, 10);
  });
</script>

<svelte:head>
  <title>Creator Standard | ELECTRIS</title>
</svelte:head>

<div class="hero">
  <h1>
    {#if isPageArabic}
      <span class="highlight">"{t('creator.standard.hero.highlight')}"</span> {t('creator.standard.hero.title')}
    {:else if isPageJapanese}
      {t('creator.standard.hero.title')} <span class="highlight">「{t('creator.standard.hero.highlight')}」</span>
    {:else}
      {t('creator.standard.hero.title')} <span class="highlight">"{t('creator.standard.hero.highlight')}"</span>
    {/if}
  </h1>
  <div class="electrical-bg"></div>
</div>

<div class="content">
  <div class="main-section">
    <h2 class="section-header">{t('creator.standard.meaning.header')}</h2>
    <p class="definition" use:glitchAction>
      {t('creator.standard.definition')}
    </p>

    <div class="explanation">
      <p use:glitchAction><T key="creator.standard.explanation.p1" /></p>

      <p use:glitchAction><T key="creator.standard.explanation.p2" /></p>
    </div>
  </div>
</div>

<style>

  .hero {
    font-family: var(--font-display);
    text-align: center;
    padding-top: var(--layout-nav-height);
    margin-bottom: var(--space-3);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 29rem;
    position: relative;
    overflow: hidden;
  }

  .electrical-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: electrical-pulse 4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes electrical-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  .hero h1 {
    font-family: var(--font-display);
    font-size: 4rem;
    margin: 0;
    position: relative;
    z-index: var(--z-raised);
    transition: var(--transition-colors);
  }

  .highlight {
    font-family: var(--font-game);
    font-size: 4.2rem;
    position: relative;
    display: inline-block;
  }

  .content {
    max-width: 54rem;
    margin: 0 auto;
    padding: 0 var(--space-5) var(--space-8);
    position: relative;
  }

  .main-section {
    text-align: left;
  }

  .section-header {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    margin-bottom: var(--space-5);
    border-bottom: 2px solid;
    padding-bottom: var(--space-3);
    position: relative;
    overflow: hidden;
  }

  .section-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%);
    animation: border-scan 3s ease-in-out infinite;
    opacity: 0.6;
  }

  @keyframes border-scan {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0%); }
    100% { transform: translateX(100%); }
  }

  .definition {
    font-family: var(--font-body);
    font-size: var(--text-2xl);
    margin-bottom: var(--space-6);
    font-weight: 400;
    font-style: italic;
    position: relative;
    transition: var(--transition-colors);
  }

  .explanation {
    font-family: var(--font-body);
    font-size: var(--text-md);
    line-height: 1.6;
  }

  .explanation p {
    margin-bottom: var(--space-5);
    font-weight: 300;
    position: relative;
    transition:
      var(--transition-colors),
      letter-spacing var(--duration-normal) var(--ease-out);
    cursor: default;
  }

  .explanation p:hover {
    letter-spacing: 0.5px;
  }

  @keyframes screen-distort {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(0.5px, -0.5px) scale(1.001); }
    66% { transform: translate(-0.5px, 0.5px) scale(0.999); }
  }

  .content {
    animation: screen-distort 8s ease-in-out infinite;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      color-mix(in srgb, var(--accent) 1%, transparent) 2px,
      color-mix(in srgb, var(--accent) 1%, transparent) 4px
    );
    animation: scan-lines 0.1s linear infinite;
    pointer-events: none;
    opacity: 0.5;
  }

  @keyframes scan-lines {
    0% { transform: translateY(0); }
    100% { transform: translateY(4px); }
  }

  @media (max-width: 900px) {
    .hero {
      padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-4) var(--space-6);
      min-height: 30rem;
    }

    .content {
      padding: 0 var(--space-4) var(--space-8);
    }

    .section-header {
      font-size: var(--text-2xl);
    }

    .definition {
      font-size: var(--text-xl);
    }
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 3rem;
    }

    .highlight {
      font-size: 3.2rem;
    }

    .definition {
      font-size: var(--text-xl);
    }

    .explanation {
      font-size: var(--text-md);
    }
  }

  @media (max-width: 560px) {
    .hero {
      padding-top: var(--layout-page-top);
      min-height: 24rem;
    }

    .hero h1 {
      font-size: clamp(2.4rem, 11vw, 3rem);
    }

    .highlight {
      font-size: clamp(2.5rem, 12vw, 3.2rem);
    }

    .content {
      padding-inline: var(--space-4);
    }

    .section-header {
      font-size: var(--text-xl);
    }

    .definition {
      font-size: var(--text-xl);
      margin-bottom: var(--space-5);
    }

    .explanation {
      font-size: var(--text-base);
    }
  }
</style>
