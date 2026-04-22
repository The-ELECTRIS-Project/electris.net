<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import { i18nState, t } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import YoutubeCard from '$lib/UI/components/YoutubeCard.svelte';
  import { formatYoutubeDateTime } from '$lib/utils/youtube';

  let { data } = $props();
  let youtube = $derived(data.youtube);
  let locale = $derived(i18nState.currentLocale || undefined);

  const liveAndUpcoming = $derived(youtube.videos.filter((video) => video.status === 'live' || video.status === 'upcoming'));

  const finishedVideos = $derived.by(() => {
    const map = new Map();

    youtube.videos
      .filter((video) => video.status === 'finished')
      .forEach((video) => {
        if (!map.has(video.channelId)) {
          map.set(video.channelId, video);
        }
      });

    return Array.from(map.values()).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  });

  onMount(() => {
    const handleSuffixToggle = () => {
      invalidateAll();
    };

    window.addEventListener('devtoolsIgnoreExcludedSuffixesChanged', handleSuffixToggle);

    return () => {
      window.removeEventListener('devtoolsIgnoreExcludedSuffixesChanged', handleSuffixToggle);
    };
  });

  let lastUpdatedLabel = $derived(
    youtube.lastUpdated ? formatYoutubeDateTime(new Date(youtube.lastUpdated).toISOString(), locale) : t('videos.last_updated.empty', 'Awaiting refresh')
  );

  useHoverConfig([
    {
      selectors: ['.youtube-card'],
      className: 'hovered-youtube-card',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-electro) 42%, var(--color-primary) 58%)'
    },
    {
      selectors: ['.video-shell'],
      className: 'hovered-youtube-shell',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-primary) 64%, var(--color-electro) 36%)'
    },
    {
      selectors: ['.back-link'],
      className: 'hovered-youtube-back',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--color-electro) 56%, var(--color-primary) 44%)'
    }
  ]);
</script>

<svelte:head>
  <title>Video Feed | ELECTRIS</title>
</svelte:head>

<div class="videos-page reveal-block visible">
  <div class="background-grid" aria-hidden="true"></div>
  <div class="page-glow glow-a" aria-hidden="true"></div>
  <div class="page-glow glow-b" aria-hidden="true"></div>

  <header class="page-header wrap-no-interact-all">
    <div class="page-copy">
      <p class="page-kicker">{t('videos.page.kicker', 'YouTube // signal feed')}</p>
      <h1>{t('videos.page.title', 'Latest Broadcasts')}</h1>
      <p class="page-intro">
        {t('videos.page.intro', 'The latest uploads from the ELECTRIS channels')}
      </p>
    </div>

    <div class="header-side">
      <div class="page-metrics">
        <article class="metric-card">
          <span>{t('videos.metric.live', 'Live / upcoming')}</span>
          <strong>{liveAndUpcoming.length}</strong>
        </article>
        <article class="metric-card">
          <span>{t('videos.metric.latest', 'Latest uploads')}</span>
          <strong>{finishedVideos.length}</strong>
        </article>
        <article class="metric-card wide">
          <span>{t('videos.metric.refresh', 'Last refresh')}</span>
          <strong>{lastUpdatedLabel}</strong>
        </article>
      </div>

      <a href="/" class="back-link wrap-no-interact-all">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('videos.back_home', 'Back to Base')}
      </a>
    </div>
  </header>

  {#if liveAndUpcoming.length > 0}
    <section class="video-shell">
      <div class="section-header">
        <div class="section-copy-group">
          <p class="section-kicker">{t('videos.section.live.kicker', 'Signal Window')}</p>
          <h2 class="section-title">
            <span class="indicator-dot"></span>
            {t('videos.section.live', 'Live & Upcoming')}
          </h2>
        </div>
        <p class="section-copy">
          {t('videos.section.live.copy', 'If a stream is active or already scheduled, it lands here.')}
        </p>
      </div>

      <div class:single={liveAndUpcoming.length === 1} class="video-grid">
        {#each liveAndUpcoming as video}
          <YoutubeCard {video} big={liveAndUpcoming.length === 1} />
        {/each}
      </div>
    </section>
  {/if}

  {#if finishedVideos.length > 0}
    <section class="video-shell latest-shell">
      <div class="section-header">
        <div class="section-copy-group">
          <p class="section-kicker">{t('videos.section.latest.kicker', 'Network Feed')}</p>
          <h2 class="section-title">{t('videos.section.latest', 'Latest Uploads')}</h2>
        </div>
        <p class="section-copy">
          {t('videos.section.latest.copy', 'Each channel contributes its newest finished upload, with the player frame adapting to the actual video shape instead of forcing one generic format.')}
        </p>
      </div>

      <div class:single={finishedVideos.length === 1} class="video-grid">
        {#each finishedVideos as video}
          <YoutubeCard {video} big={finishedVideos.length === 1} />
        {/each}
      </div>
    </section>
  {:else if liveAndUpcoming.length === 0}
    <div class="empty-state wrap-no-interact-all">
      <p class="empty-kicker">{t('videos.empty_state.kicker', 'No active signals')}</p>
      <h2>{t('videos.empty_state.title', 'Nothing is on the wire right now.')}</h2>
      <p>{t('videos.empty_state', 'No signals found. Please check back later.')}</p>
    </div>
  {/if}
</div>

<style>
  .reveal-block {
    opacity: 0;
    transform: translateY(2.5rem);
    transition:
      opacity 0.9s ease,
      transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .reveal-block.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .videos-page {
    --surface-border: color-mix(in srgb, var(--color-primary) 18%, transparent);
    --surface-border-strong: color-mix(in srgb, var(--color-electro) 28%, var(--color-primary) 20%);
    --surface-base: color-mix(in srgb, var(--bg-body) 82%, transparent);
    --surface-elevated: color-mix(in srgb, var(--bg-body) 90%, transparent);
    position: relative;
    isolation: isolate;
    max-width: 90rem;
    margin: 0 auto;
    padding: 8rem clamp(1.1rem, 3vw, 2.4rem) 6rem;
    overflow: clip;
  }

  .background-grid,
  .page-glow {
    position: absolute;
    pointer-events: none;
    z-index: -1;
  }

  .background-grid {
    inset: 0;
    opacity: 0.42;
    background-image:
      linear-gradient(color-mix(in srgb, var(--color-primary) 10%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--color-electro) 9%, transparent) 1px, transparent 1px);
    background-size: 6rem 6rem;
    mask: linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%);
  }

  .page-glow {
    width: 26rem;
    height: 26rem;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.44;
  }

  .glow-a {
    top: 6rem;
    right: -8rem;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-electro) 20%, transparent), transparent 72%);
  }

  .glow-b {
    top: 30rem;
    left: -8rem;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 72%);
  }

  .page-header,
  .video-shell,
  .empty-state {
    position: relative;
    border-radius: 2rem;
    border: 1px solid var(--surface-border);
    background:
      radial-gradient(circle at 14% 16%, color-mix(in srgb, var(--color-electro) 10%, transparent), transparent 38%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 95%, transparent), color-mix(in srgb, var(--surface-base) 98%, transparent));
    box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.14);
    overflow: hidden;
  }

  .page-header::before,
  .video-shell::before,
  .empty-state::before {
    content: '';
    position: absolute;
    inset: 0.95rem;
    border-radius: 1.45rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 12%, transparent);
    pointer-events: none;
  }

  .page-header {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    gap: 1.3rem;
    padding: clamp(1.2rem, 2.8vw, 1.8rem);
    margin-bottom: 1.3rem;
  }

  .page-copy {
    min-width: 0;
  }

  .page-kicker,
  .section-kicker,
  .metric-card span,
  .back-link,
  .section-title,
  .empty-kicker {
    font-family: 'Redwing', Aileron, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.09em;
  }

  .page-kicker {
    margin: 0 0 1rem;
    font-size: 0.75rem;
    opacity: 0.78;
  }

  .page-header h1 {
    margin: 0 0 1rem;
    font-family: 'Letric';
    font-size: clamp(3rem, 7vw, 6.4rem);
    line-height: 0.93;
    text-transform: uppercase;
  }

  .page-intro,
  .section-copy,
  .empty-state p {
    margin: 0;
    font-family: Aileron, sans-serif;
    line-height: 1.7;
  }

  .page-intro {
    max-width: 38rem;
    font-size: 1.05rem;
    opacity: 0.9;
  }

  .header-side {
    display: grid;
    gap: 1rem;
    align-content: space-between;
  }

  .page-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .metric-card {
    display: grid;
    gap: 0.4rem;
    padding: 0.95rem 1rem;
    border-radius: 1.2rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 14%, transparent);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--color-electro) 7%, transparent), transparent 60%),
      color-mix(in srgb, var(--surface-elevated) 94%, transparent);
  }

  .metric-card.wide {
    grid-column: 1 / -1;
  }

  .metric-card span {
    font-size: 0.62rem;
    opacity: 0.72;
  }

  .metric-card strong {
    font-family: Aileron, sans-serif;
    font-size: 1rem;
    line-height: 1.45;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    padding: 0.95rem 1.15rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--color-electro) 22%, transparent);
    background: color-mix(in srgb, var(--surface-elevated) 90%, transparent);
    color: inherit;
    text-decoration: none;
    font-size: 0.76rem;
    transition:
      transform 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .back-link:hover {
    transform: translateX(-0.25rem);
    border-color: var(--surface-border-strong);
    box-shadow: 0 0.9rem 2.2rem rgba(0, 0, 0, 0.16);
  }

  .back-link svg {
    width: 1rem;
    height: 1rem;
  }

  .video-shell,
  .empty-state {
    padding: clamp(1.1rem, 2.5vw, 1.6rem);
  }

  .video-shell + .video-shell,
  .video-shell + .empty-state {
    margin-top: 1.15rem;
  }

  .latest-shell {
    background:
      radial-gradient(circle at 82% 14%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 40%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 95%, transparent), color-mix(in srgb, var(--surface-base) 98%, transparent));
  }

  .section-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.72fr);
    gap: 1rem;
    align-items: end;
    margin-bottom: 1.1rem;
  }

  .section-copy-group {
    min-width: 0;
  }

  .section-kicker {
    margin: 0 0 0.7rem;
    font-size: 0.68rem;
    opacity: 0.74;
  }

  .section-title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: clamp(1.1rem, 2vw, 1.45rem);
    line-height: 1.2;
  }

  .indicator-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: #ff4e4e;
    box-shadow: 0 0 1rem rgba(255, 78, 78, 0.4);
  }

  .section-copy {
    font-size: 0.98rem;
    opacity: 0.82;
  }

  .video-grid {
    display: grid;
    gap: 1rem;
    align-items: start;
  }

  .empty-state {
    display: grid;
    justify-items: center;
    gap: 0.7rem;
    text-align: center;
  }

  .empty-kicker {
    font-size: 0.74rem;
    opacity: 0.74;
  }

  .empty-state h2 {
    margin: 0;
    font-family: 'Letric';
    font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 0.95;
    text-transform: uppercase;
  }

  @media (min-width: 900px) {
    .video-grid:not(.single) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 980px) {
    .page-header,
    .section-header {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 680px) {
    .videos-page {
      padding-top: 6.5rem;
    }

    .page-metrics {
      grid-template-columns: 1fr;
    }

    .metric-card.wide {
      grid-column: auto;
    }
  }

  @media (max-width: 560px) {
    .videos-page {
      padding-inline: 1rem;
    }

    .page-header,
    .video-shell,
    .empty-state {
      border-radius: 1.55rem;
    }

    .page-header h1 {
      font-size: clamp(2.6rem, 14vw, 4.3rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-block,
    .back-link {
      transition: none;
    }
  }

  :global([data-theme="cyber-neotic"]) .page-header,
  :global([data-theme="cyber-neotic"]) .video-shell,
  :global([data-theme="cyber-neotic"]) .empty-state {
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
    box-shadow:
      0 1.4rem 3rem rgba(0, 0, 0, 0.18),
      0 0 1.6rem color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .metric-card,
  :global([data-theme="cyber-neotic"]) .back-link {
    box-shadow: inset 0 0 1rem color-mix(in srgb, var(--color-electro) 4%, transparent);
  }
</style>
