<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/state/i18n.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';

  let visibleSections: Record<string, boolean> = $state({
    electris: false,
    electro: false
  });
  const withLineBreaks = (text: string): string => text.replace(/<br\s*\/?>/gi, '\n');

  useHoverConfig([
    {
      type: ['h1', 'h2'],
      selectors: ['.main-title', '.electris-header', '.electro-header'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        sentences: true,
        ignorePunctuation: true
      }
    },
    {
      selectors: ['.creator-standard-link'],
      className: 'hovered-about-link',
      lockPosition: true,
      preventRotation: true,
      color: 'var(--brand-electro)'
    },
    {
      type: ['p'],
      selectors: ['.callout-kicker'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        sentences: true
      }
    }
  ]);

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSections[entry.target.id] = true;
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
const orbitReset = () => {
  const orbit = document.querySelector('.circle');
  if (orbit) {
    orbit.className = "circle";
  }
};

setTimeout(orbitReset, 10);

    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>{t('about.title', 'About Us')} | ELECTRIS</title>
</svelte:head>

<div class="page-container">
  <!-- Hero/Title -->
  <header class="page-header">
    <h1 class="main-title"><u>{t('about.hero')}</u></h1>
  </header>

  <div class="content-wrapper">
    <!-- ELECTRIS SECTION -->
    <section id="electris" class:visible={visibleSections.electris} class="electris-section">
      <h2 class="section-title electris-header">{t('about.elts.hero')}</h2>
      <div class="content-text electris-text">
        <p class="intro">{t('about.elts.intro')}</p>
        <p>{t('about.elts.p1')}</p>
        <p>{t('about.elts.p2')}</p>
        <p class="statement">{withLineBreaks(t('about.elts.statement'))}</p>
      </div>
    </section>

    <!-- ELECTRO SECTION -->
    <section id="electro" class:visible={visibleSections.electro} class="electro-section">
      <h2 class="section-title electro-header">{t('about.eltr.hero')}</h2>
      <div class="content-text electro-text">
        <p class="intro">{t('about.eltr.intro')}</p>
        <p class="underintro">{t('about.eltr.underintro')}</p>
        <div class="personal-block">
          <p>{t('about.eltr.personal.p1')}</p>
          <p>{t('about.eltr.personal.p2')}</p>
        </div>
        <p>{t('about.eltr.p1')} <strong>{t('about.eltr.creator')}</strong>{t('about.eltr.p2')}</p>
        <p>{t('about.eltr.p3')}</p>
        <div class="creator-standard-callout">
          <p class="callout-kicker">
            {t('about.creatorStandard.kicker', 'A small note')}
          </p>
          <h3>{t('about.creatorStandard.title', 'The Creator Standard')}</h3>
          <p>
            {t(
              'about.creatorStandard.p1',
              'I keep something called the Creator Standard. It is not a rule I place on everyone here. It is just the personal measure I use for the work that speaks on behalf of ELECTRIS itself.'
            )}
          </p>
          <p>
            {t(
              'about.creatorStandard.p2',
              'If I ever rebuild something, that is usually why.'
            )}
          </p>
          <a href="/about/creator-standard" class="creator-standard-link wrap-no-interact-all">
            {t('about.creatorStandard.link', 'Read the Creator Standard')}
          </a>
        </div>
      </div>
    </section>

  </div>

</div>

<style>
  .page-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
    position: relative;
    overflow-x: hidden;
  }

  /* Header */
  .page-header {
    margin-bottom: var(--space-8);
    text-align: center;
  }

  .main-title {
    font-family: var(--font-display);
    font-size: var(--display-md);
    color: var(--text-primary);
    margin: 0;
  }

  /* Layout */
  .content-wrapper {
    width: 100%;
    max-width: var(--layout-measure);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  section {
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.8s var(--ease-out),
      transform 0.8s var(--ease-out);
  }

  section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    margin: 0 0 var(--space-4);
    border-bottom: 2px solid;
    display: inline-block;
    padding-bottom: var(--space-1);
  }

  .content-text {
    font-family: var(--font-body);
    font-size: var(--text-md);
    line-height: 1.6;
    opacity: 0.9;
  }

  .content-text p {
    margin-bottom: var(--space-4);
    color: inherit;
  }

  /* --- ELECTRIS STYLES --- */
  .electris-section {
    color: var(--text-primary);
  }

  .electris-header {
    color: var(--brand-electris);
    border-color: var(--brand-electris);
  }

  .intro {
    font-weight: bold;
    font-size: var(--text-lg);
  }

  .underintro {
    margin-top: calc(var(--space-4) * -1);
  }

  .statement {
    border-left: 3px solid var(--accent);
    padding-left: var(--space-4);
    font-style: italic;
    margin-top: var(--space-5);
    white-space: pre-line;
  }

  /* --- ELECTRO STYLES --- */
  .electro-header {
    color: var(--brand-electro);
    border-color: var(--brand-electro);
  }

  .electro-text strong {
    color: var(--brand-electro);
  }

  .personal-block {
    margin: var(--space-5) 0;
    padding: var(--space-4);
    border-left: 1px dashed var(--brand-electro);
    background: linear-gradient(90deg, color-mix(in srgb, var(--brand-electro) 5%, transparent), transparent);
  }

  .creator-standard-callout {
    margin-top: var(--space-6);
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--brand-electro) 30%, transparent);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--brand-electro) 10%, transparent), transparent 70%),
      color-mix(in srgb, var(--surface-page) 92%, transparent);
    box-shadow: var(--shadow-md);
  }

  .callout-kicker {
    margin: 0 0 var(--space-3);
    font-family: var(--font-ui);
    font-size: var(--text-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.78;
  }

  .creator-standard-callout h3 {
    margin: 0 0 var(--space-3);
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--brand-electro);
  }

  .creator-standard-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: var(--space-1);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-pill);
    border: 1px solid color-mix(in srgb, var(--brand-electro) 28%, transparent);
    background: color-mix(in srgb, var(--brand-electro) 10%, transparent);
    color: var(--brand-electro);
    font-family: var(--font-ui);
    font-size: var(--text-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    transition:
      var(--transition-colors),
      transform var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .creator-standard-link:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--brand-electro) 48%, transparent);
    background: color-mix(in srgb, var(--brand-electro) 14%, transparent);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 900px) {
    .page-container {
      padding: calc(var(--layout-page-top) + var(--space-4)) var(--space-5) var(--space-8);
    }

    .page-header {
      margin-bottom: var(--space-7);
    }

    .content-text {
      font-size: var(--text-md);
      line-height: 1.7;
    }

    .creator-standard-link {
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-xs);
    }
  }

  @media (max-width: 768px) {
    .main-title { font-size: var(--text-3xl); }
    .section-title { font-size: var(--text-xl); }
  }

  @media (max-width: 560px) {
    .page-container {
      padding: var(--layout-page-top) var(--space-4) var(--space-7);
    }

    .main-title {
      font-size: clamp(2.4rem, 13vw, 3rem);
    }

    .section-title {
      font-size: var(--text-xl);
    }

    .content-wrapper {
      max-width: none;
      gap: var(--space-7);
    }

    .content-text {
      font-size: var(--text-base);
    }

    .intro {
      font-size: var(--text-md);
    }

    .personal-block,
    .creator-standard-callout {
      padding: var(--space-4);
    }

    .creator-standard-link {
      width: 100%;
      text-align: center;
    }
  }
</style>
