<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';

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
  <title>Terms | TWAOS | ELECTRIS</title>
</svelte:head>

<div class="hero">
  <h1 class="game-title">{t('proj.twaos.terms.hero.title')}</h1>
  <h2 class="page-subtitle">{t('proj.twaos.terms.hero.sub')}</h2>
</div>

<div class="content">
  <p class="intro">{t('proj.twaos.terms.intro')}</p>

  <section>
    <h2 class="section-header wrap-sentence">{t('proj.twaos.terms.tos.header')}</h2>
    <p>{t('proj.twaos.terms.tos.p1')}</p>

    <div class="cc0-notice">
      <h3 class="wrap-sentence">{t('proj.twaos.terms.cc0.title')}</h3>
      <p>{t('proj.twaos.terms.cc0.desc')}</p>
      <div class="notice-glow"></div>
    </div>
  </section>

  <section>
    <h2 class="section-header wrap-sentence">{t('proj.twaos.terms.privacy.header')}</h2>
    <p>{t('proj.twaos.terms.privacy.p1')}</p>
  </section>
</div>

<style>
  .hero {
    text-align: center;
    padding-top: 5vmin;
    margin-bottom: 1vmin;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 30vmin;
  }

  .game-title {
    font-family: 'Nightcore';
    font-size: 5rem;
    margin: 0;
    color: var(--color-primary);
    text-shadow: 0 0 10px color-mix(in srgb, var(--color-primary) 30%, transparent),
                 0 0 20px color-mix(in srgb, var(--color-primary) 20%, transparent),
                 0 0 30px color-mix(in srgb, var(--color-primary) 5%, transparent);
  }

  .page-subtitle {
    font-family: 'Redwing';
    font-weight: 500;
    font-size: 1.8rem;
    margin: 1vmin 0 0;
  }

  .content {
    font-family: 'Redwing';
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px 80px;
    text-align: left;
  }

  .content p {
    font-size: 1.2rem;
    line-height: 1.6;
    font-weight: 300;
    margin-bottom: 25px;
  }

  .intro {
    font-size: 1.3rem;
    font-style: italic;
    margin-bottom: 4vmin;
  }

  .section-header {
    font-family: 'Nightcore';
    font-size: 2.5rem;
    margin-bottom: 20px;
    border-bottom: 2px solid;
    padding-bottom: 10px;
  }

  .cc0-notice {
    margin: 3vmin 0;
    padding: 2vmin;
    border-radius: 0.5vmin;
    border-left: 0.3vmin solid;
    position: relative;
    overflow: hidden;
  }

  .cc0-notice h3 {
    font-family: 'Nightcore';
    font-size: 2rem;
    margin: 0 0 15px 0;
    position: relative;
    z-index: 2;
  }

  .cc0-notice p {
    margin: 0;
    font-weight: 500;
    position: relative;
    z-index: 2;
  }

  .notice-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateX(-100%);
    animation: notice-sweep 6s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes notice-sweep {
    0% { transform: translateX(-100%) skewX(-15deg); }
    50% { transform: translateX(0%) skewX(-15deg); }
    100% { transform: translateX(100%) skewX(-15deg); }
  }

  @media (max-width: 900px) {
    .hero {
      padding: 6.5rem 1rem 2rem;
      min-height: 20rem;
    }

    .game-title {
      font-size: 3.6rem;
    }

    .page-subtitle {
      font-size: 1.4rem;
    }

    .content {
      padding: 0 1rem 4rem;
    }

    .section-header {
      font-size: 2.1rem;
    }

    .cc0-notice {
      padding: 1.25rem;
      border-radius: 1rem;
    }
  }

  @media (max-width: 560px) {
    .hero {
      padding-top: 5.75rem;
      min-height: 16rem;
    }

    .game-title {
      font-size: clamp(2.6rem, 12vw, 3.2rem);
    }

    .page-subtitle {
      font-size: 1.15rem;
    }

    .content p {
      font-size: 1rem;
    }

    .intro {
      font-size: 1.05rem;
    }

    .section-header {
      font-size: 1.75rem;
    }

    .cc0-notice h3 {
      font-size: 1.5rem;
    }
  }
</style>
