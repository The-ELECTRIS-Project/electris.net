<script lang="ts">
  import { i18nState } from '$lib/stores/i18n.svelte';
  import type { YoutubeVideo } from '$lib/types/youtube';
  import {
    formatYoutubeDate,
    formatYoutubeDateTime,
    getYoutubeAspect,
    getYoutubeMediaDimensions,
    getYoutubeWatchUrl
  } from '$lib/utils/youtube';

  interface Props {
    videos: YoutubeVideo[];
  }

  let { videos }: Props = $props();

  let featuredVideo = $derived(videos[0] ?? null);
  let locale = $derived(i18nState.currentLocale || undefined);
  let mediaDimensions = $derived(featuredVideo ? getYoutubeMediaDimensions(featuredVideo) : { width: 16, height: 9 });
  let aspect = $derived(featuredVideo ? getYoutubeAspect(featuredVideo) : 'landscape');
  let watchUrl = $derived(featuredVideo ? getYoutubeWatchUrl(featuredVideo.id) : '#');

  let timingLabel = $derived.by(() => {
    if (!featuredVideo) return '';

    if (featuredVideo.status === 'live') {
      return featuredVideo.actualStartTime
        ? `Started ${formatYoutubeDateTime(featuredVideo.actualStartTime, locale)}`
        : `Live from ${formatYoutubeDateTime(featuredVideo.publishedAt, locale)}`;
    }

    return featuredVideo.scheduledStartTime
      ? `Scheduled ${formatYoutubeDateTime(featuredVideo.scheduledStartTime, locale)}`
      : `Announced ${formatYoutubeDate(featuredVideo.publishedAt, locale)}`;
  });
</script>

{#if featuredVideo}
  <section class="live-signal-container">
    <a
      href={watchUrl}
      target="_blank"
      rel="noreferrer"
      class="live-signal-bar wrap-no-interact-all"
      class:portrait={aspect === 'portrait'}
      style={`--live-width:${mediaDimensions.width}; --live-height:${mediaDimensions.height};`}
    >
      <div class="preview-shell">
        <div class="preview-frame">
          <img src={featuredVideo.thumbnail} alt={`Thumbnail for ${featuredVideo.title}`} loading="lazy" decoding="async" />
        </div>
      </div>

      <div class="live-copy">
        <div class="indicator-row">
          <div class={`live-indicator ${featuredVideo.status}`}>
            <span class="indicator-dot"></span>
            <span class="indicator-text">{featuredVideo.status === 'live' ? 'Broadcast active' : 'Broadcast queued'}</span>
          </div>
          <span class="channel-pill">{featuredVideo.channelName}</span>
        </div>

        <p class="live-title">{featuredVideo.title}</p>
        <p class="live-summary">
          {featuredVideo.status === 'live'
            ? 'A stream is live right now, surfaced as a proper feature block instead of a thin utility banner.'
            : 'The next stream is already on the calendar, with enough space to feel like a real part of the page.'}
        </p>

        <p class="live-meta">{timingLabel}</p>
      </div>

      <div class="live-cta">
        <span>{featuredVideo.status === 'live' ? 'Open stream on YouTube' : 'Open stream page'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  </section>
{/if}

<style>
  .live-signal-container {
    width: min(100%, 72rem);
    margin: 0 auto 2.8rem;
    position: relative;
    z-index: 2;
  }

  .live-signal-bar {
    --live-surface-base: var(--surface-base, color-mix(in srgb, var(--bg-body) 82%, transparent));
    --live-surface-elevated: var(--surface-elevated, color-mix(in srgb, var(--bg-body) 90%, transparent));
    display: grid;
    grid-template-columns: minmax(12rem, 15rem) minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border-radius: 1.8rem;
    border: 1px solid color-mix(in srgb, var(--color-electro) 24%, var(--color-primary) 18%);
    background:
      radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--color-electro) 14%, transparent), transparent 35%),
      linear-gradient(160deg, color-mix(in srgb, var(--live-surface-elevated) 94%, transparent), color-mix(in srgb, var(--live-surface-base) 98%, transparent));
    box-shadow:
      0 1rem 2.8rem rgba(0, 0, 0, 0.14),
      0 0 1.4rem color-mix(in srgb, var(--color-electro) 8%, transparent);
    color: inherit;
    text-decoration: none;
    transition:
      transform 0.35s ease,
      border-color 0.35s ease,
      box-shadow 0.35s ease;
  }

  .live-signal-bar:hover {
    transform: translateY(-0.3rem);
    border-color: color-mix(in srgb, var(--color-electro) 42%, var(--color-primary) 24%);
    box-shadow:
      0 1.35rem 3rem rgba(0, 0, 0, 0.18),
      0 0 1.8rem color-mix(in srgb, var(--color-electro) 12%, transparent);
  }

  .preview-shell,
  .live-copy {
    min-width: 0;
  }

  .preview-frame {
    position: relative;
    width: 100%;
    aspect-ratio: var(--live-width) / var(--live-height);
    overflow: hidden;
    border-radius: 1.25rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
    background: #060809;
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 4%, transparent),
      0 1rem 1.8rem rgba(0, 0, 0, 0.2);
  }

  .portrait .preview-frame {
    max-width: 10rem;
    margin-inline: auto;
  }

  .preview-frame img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .indicator-row,
  .live-cta {
    font-family: 'Redwing', Aileron, sans-serif;
  }

  .indicator-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    align-items: center;
  }

  .live-indicator,
  .channel-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.45rem 0.78rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    font-size: 0.72rem;
    line-height: 1;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .live-indicator.live {
    border-color: color-mix(in srgb, #ff4e4e 28%, transparent);
    background: color-mix(in srgb, #ff4e4e 10%, transparent);
  }

  .live-indicator.upcoming {
    border-color: color-mix(in srgb, #4e9cff 28%, transparent);
    background: color-mix(in srgb, #4e9cff 10%, transparent);
  }

  .indicator-dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: #ff4e4e;
    box-shadow: 0 0 0.9rem rgba(255, 78, 78, 0.4);
    animation: live-pulse 1.5s infinite;
  }

  .upcoming .indicator-dot {
    background: #4e9cff;
    box-shadow: 0 0 0.9rem rgba(78, 156, 255, 0.35);
  }

  .indicator-text,
  .channel-pill {
    color: inherit;
  }

  .channel-pill {
    background: color-mix(in srgb, var(--color-electro) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-electro) 18%, transparent);
  }

  .live-copy {
    display: grid;
    gap: 0.75rem;
  }

  .live-title {
    margin: 0;
    font-family: 'Redwing', Aileron, sans-serif;
    font-size: clamp(1.45rem, 3vw, 2.35rem);
    line-height: 1.12;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .live-summary,
  .live-meta {
    margin: 0;
    font-family: Aileron, sans-serif;
    line-height: 1.7;
  }

  .live-summary {
    font-size: 1rem;
    opacity: 0.9;
  }

  .live-meta {
    font-size: 0.95rem;
    opacity: 0.78;
  }

  .live-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    justify-self: end;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--color-electro) 68%, currentColor 32%);
  }

  .live-cta svg {
    width: 1rem;
    height: 1rem;
    transition: transform 0.3s ease;
  }

  .live-signal-bar:hover .live-cta svg {
    transform: translateX(0.18rem);
  }

  @keyframes live-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.28);
      opacity: 0.62;
    }
  }

  @media (max-width: 900px) {
    .live-signal-bar {
      grid-template-columns: minmax(0, 1fr);
    }

    .live-cta {
      justify-self: start;
    }
  }

  @media (max-width: 560px) {
    .live-signal-bar {
      padding: 0.9rem;
      border-radius: 1.45rem;
    }

    .preview-frame {
      border-radius: 1rem;
    }

    .live-title {
      font-size: clamp(1.35rem, 8vw, 1.9rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .live-signal-bar,
    .live-cta svg,
    .indicator-dot {
      transition: none;
      animation: none;
    }
  }

  :global([data-theme="cyber-neotic"]) .live-signal-bar {
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
    box-shadow:
      0 1.25rem 2.8rem rgba(0, 0, 0, 0.18),
      0 0 1.8rem color-mix(in srgb, var(--color-electro) 12%, transparent);
  }

  :global([data-theme="cyber-neotic"]) .preview-frame,
  :global([data-theme="cyber-neotic"]) .live-indicator,
  :global([data-theme="cyber-neotic"]) .channel-pill {
    box-shadow: inset 0 0 0.9rem color-mix(in srgb, var(--color-electro) 4%, transparent);
  }
</style>
