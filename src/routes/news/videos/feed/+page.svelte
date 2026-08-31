<script lang="ts">
  import { i18nState, t } from '$lib/state/i18n.svelte';
  import { modsState } from '$lib/state/mods.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
  import YoutubeCard from '$lib/components/youtube/Card.svelte';
  import type { YoutubeVideo } from '$lib/types/youtube';
  import {
    formatYoutubeDate,
    formatYoutubeDateTime,
    getYoutubeWatchUrl,
    PREVIOUS_UPLOAD_LIMIT
  } from '$lib/utils/youtube';

  let { data } = $props();
  let youtube = $derived(data.youtube);
  let locale = $derived(i18nState.currentLocale || undefined);
  let includeExcludedVideos = $derived(modsState.config.devTools.ignoreExcludedSuffixes);
  let visibleVideos = $derived(youtube.videos.filter((video) => includeExcludedVideos || !video.isExcluded));

  const liveAndUpcoming = $derived(visibleVideos.filter((video) => video.status === 'live' || video.status === 'upcoming'));

  const finishedVideos = $derived.by(() => {
    const map = new Map<string, YoutubeVideo>();

    visibleVideos
      .filter((video) => video.status === 'finished')
      .forEach((video) => {
        if (!map.has(video.channelId)) {
          map.set(video.channelId, video);
        }
      });

    return Array.from(map.values()).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  });

  const previousVideos = $derived.by(() => {
    const newest = new Set(finishedVideos.map((video) => video.id));

    return visibleVideos
      .filter((video) => video.status === 'finished' && !newest.has(video.id))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, PREVIOUS_UPLOAD_LIMIT);
  });

  let lastUpdatedLabel = $derived(
    youtube.lastUpdated ? formatYoutubeDateTime(new Date(youtube.lastUpdated).toISOString(), locale) : t('videos.last_updated.empty', 'Not checked yet')
  );

  useHoverConfig([
    {
      selectors: ['.video-shell'],
      className: 'hovered-youtube-shell',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--accent) 64%, var(--brand-electro) 36%)'
    },
    {
      selectors: ['.back-link'],
      className: 'hovered-youtube-back',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--brand-electro) 56%, var(--accent) 44%)'
    },
    {
      selectors: ['.previous-item'],
      className: 'hovered-youtube-previous',
      lockPosition: true,
      preventRotation: true,
      color: 'color-mix(in srgb, var(--accent) 72%, var(--brand-electro) 28%)'
    }
  ]);
</script>

<svelte:head>
  <title>Video Feed | ELECTRIS</title>
</svelte:head>

<div class="videos-page">
  <div class="background-grid" aria-hidden="true"></div>
  <div class="page-glow glow-a" aria-hidden="true"></div>
  <div class="page-glow glow-b" aria-hidden="true"></div>

  <header class="page-header wrap-no-interact-all">
    <div class="page-copy">
      <p class="page-kicker">{t('videos.page.kicker', 'From the channels')}</p>
      <h1>{t('videos.page.title', 'Videos')}</h1>
      <p class="page-intro">
        {t('videos.page.intro', 'The latest from the channels ELECTRIS supports.')}
      </p>
    </div>

    <div class="header-side">
      <div class="page-metrics">
        <article class="metric-card">
          <span>{t('videos.metric.live', 'Live and upcoming')}</span>
          <strong>{liveAndUpcoming.length}</strong>
        </article>
        <article class="metric-card">
          <span>{t('videos.metric.latest', 'Latest uploads')}</span>
          <strong>{finishedVideos.length}</strong>
        </article>
        <article class="metric-card wide">
          <span>{t('videos.metric.refresh', 'Last checked')}</span>
          <strong>{lastUpdatedLabel}</strong>
        </article>
      </div>

      <a href="/" class="back-link wrap-no-interact-all">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('videos.back_home', 'Back home')}
      </a>
    </div>
  </header>

  {#if liveAndUpcoming.length > 0}
    <section class="video-shell">
      <div class="section-header">
        <div class="section-copy-group">
          <p class="section-kicker">{t('videos.section.live.kicker', 'Right now')}</p>
          <h2 class="section-title">
            <span class="indicator-dot"></span>
            {t('videos.section.live', 'Live and Upcoming')}
          </h2>
        </div>
        <p class="section-copy">
          {t('videos.section.live.copy', 'Anything streaming now or already scheduled shows up here.')}
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
          <p class="section-kicker">{t('videos.section.latest.kicker', 'Newest')}</p>
          <h2 class="section-title">{t('videos.section.latest', 'Latest Uploads')}</h2>
        </div>
      </div>

      <div class:single={finishedVideos.length === 1} class="video-grid">
        {#each finishedVideos as video}
          <YoutubeCard {video} big={finishedVideos.length === 1} />
        {/each}
      </div>
    </section>
  {:else if liveAndUpcoming.length === 0}
    <div class="empty-state wrap-no-interact-all">
      <p class="empty-kicker">{t('videos.empty_state.kicker', 'Nothing yet')}</p>
      <h2>{t('videos.empty_state.title', 'No videos right now.')}</h2>
      <p>{t('videos.empty_state', 'Nothing has gone up recently. Check back later.')}</p>
    </div>
  {/if}

  {#if previousVideos.length > 0}
    <section class="video-shell">
      <div class="section-header">
        <div class="section-copy-group">
          <p class="section-kicker">{t('videos.section.previous.kicker', 'Before that')}</p>
          <h2 class="section-title">{t('videos.section.previous', 'Previous Uploads')}</h2>
        </div>
      </div>

      <ul class="previous-list">
        {#each previousVideos as video}
          <li>
            <a
              href={getYoutubeWatchUrl(video.id)}
              target="_blank"
              rel="noreferrer"
              class="previous-item wrap-no-interact-all"
            >
              <img src={video.thumbnail} alt="" loading="lazy" />
              <span class="previous-copy">
                <strong>{video.title}</strong>
                <span class="previous-meta">
                  <span>{video.channelName}</span>
                  <time datetime={video.publishedAt}>{formatYoutubeDate(video.publishedAt, locale)}</time>
                </span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>

<style>
  .videos-page {
    --surface-border: color-mix(in srgb, var(--accent) 18%, transparent);
    --surface-border-strong: color-mix(in srgb, var(--brand-electro) 28%, var(--accent) 20%);
    --surface-base: color-mix(in srgb, var(--surface-page) 82%, transparent);
    --surface-elevated: color-mix(in srgb, var(--surface-page) 90%, transparent);
    /* The live marker is fixed, so a broadcast reads as live in every theme. */
    --live-signal: #ff4e4e;
    position: relative;
    isolation: isolate;
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: var(--layout-page-top) var(--layout-page-inline) var(--space-8);
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
      linear-gradient(color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--brand-electro) 9%, transparent) 1px, transparent 1px);
    background-size: 6rem 6rem;
    mask: linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%);
  }

  .page-glow {
    width: 26rem;
    height: 26rem;
    border-radius: var(--radius-round);
    filter: blur(40px);
    opacity: 0.44;
  }

  .glow-a {
    top: 6rem;
    right: -8rem;
    background: radial-gradient(circle, color-mix(in srgb, var(--brand-electro) 20%, transparent), transparent 72%);
  }

  .glow-b {
    top: 30rem;
    left: -8rem;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 72%);
  }

  .page-header,
  .video-shell,
  .empty-state {
    position: relative;
    border-radius: var(--radius-2xl);
    border: 1px solid var(--surface-border);
    background:
      radial-gradient(circle at 14% 16%, color-mix(in srgb, var(--brand-electro) 10%, transparent), transparent 38%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 95%, transparent), color-mix(in srgb, var(--surface-base) 98%, transparent));
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .page-header::before,
  .video-shell::before,
  .empty-state::before {
    content: '';
    position: absolute;
    inset: var(--space-4);
    border-radius: calc(var(--radius-2xl) - var(--space-4));
    border: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
    pointer-events: none;
  }

  .page-header {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    gap: var(--space-4);
    padding: var(--space-5);
    margin-bottom: var(--space-4);
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
    font-family: var(--font-body);
    text-transform: uppercase;
    letter-spacing: 0.09em;
  }

  .page-kicker {
    margin: 0 0 var(--space-4);
    font-size: var(--text-2xs);
    opacity: 0.78;
  }

  .page-header h1 {
    margin: 0 0 var(--space-4);
    font-family: var(--font-display);
    font-size: var(--display-lg);
    line-height: 0.93;
    text-transform: uppercase;
  }

  .page-intro,
  .section-copy,
  .empty-state p {
    margin: 0;
    font-family: var(--font-ui);
    line-height: 1.7;
  }

  .page-intro {
    max-width: var(--layout-measure);
    font-size: var(--text-base);
    opacity: 0.9;
  }

  .header-side {
    display: grid;
    gap: var(--space-4);
    align-content: space-between;
  }

  .page-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .metric-card {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--accent) 14%, transparent);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--brand-electro) 7%, transparent), transparent 60%),
      color-mix(in srgb, var(--surface-elevated) 94%, transparent);
  }

  .metric-card.wide {
    grid-column: 1 / -1;
  }

  .metric-card span {
    font-size: var(--text-2xs);
    opacity: 0.72;
  }

  .metric-card strong {
    font-family: var(--font-ui);
    font-size: var(--text-base);
    line-height: 1.45;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-pill);
    border: 1px solid color-mix(in srgb, var(--brand-electro) 22%, transparent);
    background: color-mix(in srgb, var(--surface-elevated) 90%, transparent);
    color: inherit;
    text-decoration: none;
    font-size: var(--text-2xs);
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .back-link:hover {
    transform: translateX(-0.25rem);
    border-color: var(--surface-border-strong);
    box-shadow: var(--shadow-md);
  }

  .back-link svg {
    width: 1rem;
    height: 1rem;
  }

  .video-shell,
  .empty-state {
    padding: var(--space-5);
  }

  .video-shell + .video-shell,
  .video-shell + .empty-state {
    margin-top: var(--space-4);
  }

  .latest-shell {
    background:
      radial-gradient(circle at 82% 14%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 40%),
      linear-gradient(160deg, color-mix(in srgb, var(--surface-elevated) 95%, transparent), color-mix(in srgb, var(--surface-base) 98%, transparent));
  }

  .section-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.72fr);
    gap: var(--space-4);
    align-items: end;
    margin-bottom: var(--space-4);
  }

  .section-copy-group {
    min-width: 0;
  }

  .section-kicker {
    margin: 0 0 var(--space-3);
    font-size: var(--text-2xs);
    opacity: 0.74;
  }

  .section-title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-xl);
    line-height: 1.2;
  }

  .indicator-dot {
    width: var(--space-3);
    height: var(--space-3);
    border-radius: var(--radius-round);
    background: var(--live-signal);
    box-shadow: 0 0 var(--space-4) color-mix(in srgb, var(--live-signal) 40%, transparent);
  }

  .section-copy {
    font-size: var(--text-base);
    opacity: 0.82;
  }

  .video-grid {
    display: grid;
    gap: var(--space-4);
    align-items: start;
  }

  .previous-list {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .previous-item {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: var(--space-4);
    align-items: center;
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--accent) 14%, transparent);
    background: color-mix(in srgb, var(--surface-elevated) 94%, transparent);
    color: inherit;
    text-decoration: none;
    transition:
      transform var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
  }

  .previous-item:hover {
    transform: translateX(0.35rem);
    border-color: var(--surface-border-strong);
    box-shadow: var(--shadow-md);
  }

  .previous-item img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: var(--radius-md);
  }

  .previous-copy {
    display: grid;
    gap: var(--space-2);
    min-width: 0;
  }

  .previous-copy strong {
    font-family: var(--font-ui);
    font-size: var(--text-md);
    line-height: 1.3;
  }

  .previous-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    opacity: 0.72;
  }

  .empty-state {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    text-align: center;
  }

  .empty-kicker {
    font-size: var(--text-2xs);
    opacity: 0.74;
  }

  .empty-state h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--display-sm);
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
    .page-metrics {
      grid-template-columns: 1fr;
    }

    .metric-card.wide {
      grid-column: auto;
    }
  }

  @media (max-width: 560px) {
    .page-header,
    .video-shell,
    .empty-state {
      border-radius: var(--radius-xl);
    }

    .previous-item {
      grid-template-columns: 7rem minmax(0, 1fr);
      gap: var(--space-3);
    }
  }

  :global([data-theme="cyber-neotic"]) .page-header,
  :global([data-theme="cyber-neotic"]) .video-shell,
  :global([data-theme="cyber-neotic"]) .empty-state {
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
    box-shadow:
      var(--shadow-lg),
      0 0 var(--space-5) color-mix(in srgb, var(--accent) 10%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .metric-card,
  :global([data-theme="cyber-neotic"]) .back-link {
    box-shadow: inset 0 0 var(--space-4) color-mix(in srgb, var(--brand-electro) 4%, transparent);
  }
</style>
