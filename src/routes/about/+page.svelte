<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';

  let visibleSections: Record<string, boolean> = $state({
    electris: false,
    electro: false,
    varrow: false
  });
  const withLineBreaks = (text: string): string => text.replace(/<br\s*\/?>/gi, '\n');

  useHoverConfig([
    {
      type: ['h1', 'h2'],
      selectors: ['.main-title', '.electris-header', '.electro-header', '.varrow-header'],
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
      color: 'var(--color-electro)'
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

    const cursorReset = () => {
      const cursor = document.querySelector('.circle');
      if (cursor) {
        cursor.className = "circle";
      }
    };
    setTimeout(cursorReset, 10);

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

    <!-- VARROW SECTION -->
    <section id="varrow" class:visible={visibleSections.varrow} class="varrow-section">
      <h2 class="section-title varrow-header">{t('about.vrrw.hero')}</h2>
      <div class="content-text varrow-text">
        <p class="intro">{t('about.vrrw.intro')}</p>
        <div class="terminal-block">
          <blockquote class="quote-text">
            {t('about.vrrw.quote')}
          </blockquote>
          <footer class="quote-author">{t('site.author.vrrw')}</footer>
        </div>
      </div>
    </section>
  </div>
  
  <div class="ambient-dots">
    <div class="ambient-dot dot-1"></div>
    <div class="ambient-dot dot-2"></div>
  </div>
</div>
  
<style>
  .page-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120px 20px 60px;
    position: relative;
    overflow-x: hidden;
  }

  /* Header */
  .page-header {
    margin-bottom: 4rem;
    text-align: center;
  }

  .main-title {
    font-family: 'Letric';
    font-size: 3.5rem;
    color: var(--color-primary);
    margin: 0;
  }

  /* Layout */
  .content-wrapper {
    width: 100%;
    max-width: 56.64vmin;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  section {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }

  section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-title {
    font-family: 'Letric';
    font-size: 2.2rem;
    margin: 0 0 1rem 0;
    border-bottom: 2px solid;
    display: inline-block;
    padding-bottom: 0.2rem;
  }

  .content-text {
    font-family: 'Redwing';
    font-size: 1.15rem;
    line-height: 1.6;
    opacity: 0.9;
  }

  .content-text p {
    margin-bottom: 1rem;
    color: inherit;
  }

  /* --- ELECTRIS STYLES --- */
  .electris-section {
    color: var(--color-primary);
  }

  .electris-header {
    color: var(--color-electris);
    border-color: var(--color-electris);
  }

  .intro {
    font-weight: bold;
    font-size: 1.3rem;
  }

  .underintro {
    margin-top: -1.6vmin;
  }

  .statement {
    border-left: 3px solid var(--color-primary);
    padding-left: 1rem;
    font-style: italic;
    margin-top: 1.5rem;
    white-space: pre-line;
  }


  /* --- ELECTRO STYLES --- */
  .electro-header {
    color: var(--color-electro);
    border-color: var(--color-electro);
  }
  
  .electro-text strong {
    color: var(--color-electro);
  }

  .personal-block {
    margin: 1.5rem 0;
    padding: 1rem;
    border-left: 1px dashed var(--color-electro);
    background: linear-gradient(90deg, rgba(0, 255, 170, 0.05), transparent);
  }

  .creator-standard-callout {
    margin-top: 2rem;
    padding: 1.4rem;
    border-radius: 1rem;
    border: 1px solid color-mix(in srgb, var(--color-electro) 30%, transparent);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--color-electro) 10%, transparent), transparent 70%),
      color-mix(in srgb, var(--bg-body) 92%, transparent);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
  }

  .callout-kicker {
    margin: 0 0 0.75rem;
    font-family: Aileron;
    font-size: 0.78rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.78;
  }

  .creator-standard-callout h3 {
    margin: 0 0 0.85rem;
    font-family: 'Letric';
    font-size: 1.8rem;
    color: var(--color-electro);
  }

  .creator-standard-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.4rem;
    padding: 0.8rem 1rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--color-electro) 28%, transparent);
    background: color-mix(in srgb, var(--color-electro) 10%, transparent);
    color: var(--color-electro);
    font-family: Aileron;
    font-size: 0.74rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    transition:
      transform 0.3s ease,
      border-color 0.3s ease,
      background 0.3s ease,
      box-shadow 0.3s ease;
  }

  .creator-standard-link:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--color-electro) 48%, transparent);
    background: color-mix(in srgb, var(--color-electro) 14%, transparent);
    box-shadow: 0 0.8rem 1.6rem rgba(0, 0, 0, 0.16);
  }


  /* --- VARROW STYLES --- */
  .varrow-header {
    color: var(--color-varrow);
    border-color: var(--color-varrow);
  }

  .terminal-block {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--color-varrow);
    padding: 1.5rem;
    margin-top: 1rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }

  .quote-text {
    color: var(--color-varrow);
    font-size: 1.1rem;
    margin: 0;
    font-style: italic;
  }

  .quote-author {
    color: var(--color-varrow);
    text-align: right;
    margin-top: 0.5rem;
    font-weight: bold;
    opacity: 0.8;
  }


  /* Ambient Dots (Subtler) */
  .ambient-dots {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;
  }

  .ambient-dot {
    position: absolute;
    width: 2px;
    height: 2px;
    background: var(--color-primary);
    border-radius: 50%;
    opacity: 0.15; /* Reduced opacity */
  }

  .dot-1 { top: 15%; left: 5%; animation: float 15s infinite ease-in-out; }
  .dot-2 { bottom: 20%; right: 10%; animation: float 12s infinite ease-in-out reverse; }

  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(15px, -15px); }
  }

  @media (max-width: 768px) {
    .page-container { padding-top: 100px; }
    .main-title { font-size: 2.5rem; }
    .section-title { font-size: 1.8rem; }
  }

  @media (max-width: 900px) {
    .page-container {
      padding: 6.5rem 1.5rem 4rem;
    }

    .page-header {
      margin-bottom: 3rem;
    }

    .content-wrapper {
      max-width: 42rem;
    }

    .content-text {
      font-size: 1.12rem;
      line-height: 1.7;
    }

    .creator-standard-link {
      padding: 0.95rem 1.25rem;
      font-size: 0.82rem;
    }
  }

  @media (max-width: 560px) {
    .page-container {
      padding: 5.75rem 1rem 3rem;
    }

    .main-title {
      font-size: clamp(2.4rem, 13vw, 3rem);
    }

    .section-title {
      font-size: 1.75rem;
    }

    .content-wrapper {
      max-width: none;
      gap: 3rem;
    }

    .content-text {
      font-size: 1rem;
    }

    .intro {
      font-size: 1.15rem;
    }

    .personal-block,
    .creator-standard-callout,
    .terminal-block {
      padding: 1rem;
    }

    .creator-standard-link {
      width: 100%;
      text-align: center;
    }
  }
</style>
