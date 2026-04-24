<script lang="ts">
  import { i18nState } from '$lib/stores/i18n.svelte';
  import { useHoverConfig } from '$lib/stores/hoverConfig.svelte';
  import type { YoutubeVideo } from '$lib/types/youtube';
  import {
    formatYoutubeDate,
    formatYoutubeDateTime,
    getYoutubeAspect,
    getYoutubeEmbedUrl,
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
  let embedUrl = $derived(featuredVideo ? getYoutubeEmbedUrl(featuredVideo.id) : '');

  let statusLabel = $derived(
    featuredVideo?.status === 'live' ? 'Live now' : 'Upcoming'
  );

  let summary = $derived.by(() => {
    if (!featuredVideo) return '';
    if (!featuredVideo.description) {
      if (featuredVideo.status === 'live') {
        return `${featuredVideo.channelName} is live right now, with the player kept directly in the section so you can watch without leaving the page.`;
      }
      return `${featuredVideo.channelName} already has this stream scheduled, and the player frame stays shaped for the actual broadcast.`;
    }

    const paragraphs = featuredVideo.description.split(/\n\s*\n/);
    return paragraphs[0].trim();
  });

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

  function fitText(node: HTMLElement, params?: { min?: number; max?: number }) {
    const getMin = () => params?.min ?? 14;
    const getMax = () => params?.max ?? 32;

    function fit() {
      const min = getMin();
      const max = getMax();
      node.style.fontSize = `${max}px`;

      if (node.scrollWidth <= node.clientWidth) {
        return;
      }

      let lo = min;
      let hi = max;
      while (hi - lo > 0.25) {
        const mid = (lo + hi) / 2;
        node.style.fontSize = `${mid}px`;
        if (node.scrollWidth <= node.clientWidth) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      node.style.fontSize = `${lo}px`;
    }

    const ro = new ResizeObserver(fit);
    ro.observe(node);
    fit();

    return {
      update(newParams?: { min?: number; max?: number }) {
        params = newParams;
        fit();
      },
      destroy() {
        ro.disconnect();
      }
    };
  }

  useHoverConfig([
    {
      type: ['span'],
      selectors: ['.live-cta'],
      className: 'hovered-word-wrap',
      lockPosition: true,
      wrapText: {
        words: false,
        ignoreCharacters: false,
        sentences: true
      }
    }
  ]);
</script>

{#if featuredVideo}
  <section class="live-signal-container">
    <div
      class="live-signal-bar"
      class:portrait={aspect === 'portrait'}
      style={`--live-width:${mediaDimensions.width}; --live-height:${mediaDimensions.height}; --summary-len:${summary.length};`}
    >
      <div class="preview-shell">
        <div class="preview-frame">
          <div class="media-clip">
            <iframe
              class="player-frame"
              src={embedUrl}
              title={featuredVideo.title}
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>

      <div class="live-copy">
        <div class="indicator-row">
          <span class="platform-badge">YouTube</span>
          <div class={`live-indicator ${featuredVideo.status}`}>
            <span class="indicator-dot"></span>
            <span class="indicator-text">{statusLabel}</span>
          </div>
          <span class="channel-pill">{featuredVideo.channelName}</span>
        </div>

        <h3 class="live-title" use:fitText={{ min: 18, max: 32 }}>{featuredVideo.title}</h3>
        <p class="live-summary">{summary}</p>

        <p class="live-meta">{timingLabel}</p>
      </div>

      <div class="live-cta-container">
        <a href={watchUrl} target="_blank" rel="noreferrer" class="live-cta">
          <span>{featuredVideo.status === 'live' ? 'Open on YouTube →' : 'View Stream Page →'}</span>
        </a>
      </div>
    </div>
  </section>
{/if}

<style>
  .live-signal-container {
    --youtube-brand: #ff0000;
    --youtube-brand-deep: #c40000;
    --youtube-accent: #ff4d00;
    --youtube-surface-base: var(--surface-base, color-mix(in srgb, var(--bg-body) 82%, transparent));
    --youtube-surface-elevated: var(--surface-elevated, color-mix(in srgb, var(--bg-body) 90%, transparent));
    --youtube-border: color-mix(in srgb, var(--youtube-brand) 12%, transparent);

    width: min(100%, 72rem);
    margin: 0 auto 2.8rem;
    position: relative;
    z-index: 2;
    container-type: inline-size;
  }

  .live-signal-bar {
    display: grid;
    grid-template-columns: minmax(14rem, 20rem) minmax(0, 1fr) auto;
    gap: clamp(1rem, 2.5vw, 2rem);
    align-items: center;
    padding: clamp(1rem, 2.4vw, 1.45rem);
    border-radius: 2rem;
    border: 1px solid var(--youtube-border);
    background:
      radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--youtube-brand) 8%, transparent), transparent 36%),
      linear-gradient(160deg, color-mix(in srgb, var(--youtube-surface-elevated) 96%, transparent), color-mix(in srgb, var(--youtube-surface-base) 98%, transparent));
    box-shadow: 0 1.3rem 3rem rgba(0, 0, 0, 0.15);
    isolation: isolate;
    position: relative;
    transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  }

  .live-signal-bar::before {
    content: '';
    position: absolute;
    inset: 0.85rem;
    border-radius: 1.45rem;
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 8%, transparent);
    pointer-events: none;
  }

  .preview-shell,
  .live-copy {
    min-width: 0;
  }

  .preview-frame {
    position: relative;
    width: 100%;
    aspect-ratio: var(--live-width) / var(--live-height);
    border-radius: 1.45rem;
    border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
    background: #050608;
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 4%, transparent),
      0 1rem 2rem rgba(0, 0, 0, 0.22);
    overflow: hidden;
    isolation: isolate;
    clip-path: inset(0 round 1.45rem);
    transform: translateZ(0);
  }

  .portrait .preview-frame {
    max-width: 12rem;
    margin-inline: auto;
  }

  .media-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    background: #050608;
  }

  .player-frame {
    position: absolute;
    inset: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 0;
    background: #050608;
  }

  .indicator-row,
  .live-cta {
    font-family: 'Redwing', Aileron, sans-serif;
  }

  .indicator-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
  }

  .platform-badge,
  .live-indicator,
  .channel-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.78rem;
    border-radius: 999px;
    font-family: 'Redwing', Aileron, sans-serif;
    font-size: 0.72rem;
    line-height: 1;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .platform-badge {
    background: var(--youtube-brand);
    color: #fff;
    box-shadow: 0 0 1rem rgba(255, 0, 0, 0.24);
  }

  .live-indicator,
  .channel-pill {
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 22%, transparent);
    background: color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    color: inherit;
    gap: 0.55rem;
  }

  .live-indicator.live {
    border-color: color-mix(in srgb, #ff4e4e 30%, transparent);
    background: color-mix(in srgb, #ff4e4e 12%, transparent);
    color: #ffb7b7;
  }

  .live-indicator.upcoming {
    border-color: color-mix(in srgb, #ff8c00 30%, transparent);
    background: color-mix(in srgb, #ff8c00 12%, transparent);
    color: #ffd7b7;
  }

  .indicator-dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0.9rem currentColor;
    animation: live-pulse 1.5s infinite;
  }

  .live-copy {
    display: grid;
    gap: 0.75rem;
  }

  .live-title {
    margin: 0;
    font-family: 'Redwing', Aileron, sans-serif;
    line-height: 1.12;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .live-summary {
    margin: 0;
    font-family: Aileron, sans-serif;
    font-size: clamp(0.9rem, calc(400cqw / (var(--summary-len) + 150)), 1.05rem);
    line-height: 1.6;
    opacity: 0.9;
    display: -webkit-box;
    line-clamp: 2;
    box-orient: vertical;
    overflow: hidden;
  }

  .live-meta {
    margin: 0;
    font-family: Aileron, sans-serif;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.65;
  }

  .live-cta-container {
    padding-left: 1rem;
  }

  .live-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    color: color-mix(in srgb, var(--youtube-brand) 82%, currentColor 18%);
    text-decoration: none;
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 0.25s ease, transform 0.25s ease;
  }

  .live-cta:hover {
    transform: translateX(0.12rem);
    color: var(--youtube-brand);
  }

  @keyframes live-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.25); opacity: 0.6; }
  }

  @media (max-width: 1024px) {
    .live-signal-bar {
      grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
    }
    .live-cta-container {
      grid-column: 1 / -1;
      padding-left: 0;
      justify-self: start;
    }
  }

  @media (max-width: 768px) {
    .live-signal-bar {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      border-radius: 1.65rem;
    }
    .preview-frame {
      border-radius: 1.2rem;
    }
    .live-summary {
      line-clamp: 3;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .live-signal-bar,
    .live-cta,
    .indicator-dot {
      transition: none;
      animation: none;
    }
  }

  :global([data-theme="cyber-neotic"]) .live-signal-bar {
    box-shadow:
      0 1.5rem 3.2rem rgba(0, 0, 0, 0.2),
      0 0 1.6rem color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
  }

  :global([data-theme="cyber-neotic"]) .preview-frame {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 8%, transparent),
      0 1rem 2rem rgba(0, 0, 0, 0.25),
      0 0 1.2rem color-mix(in srgb, var(--youtube-brand) 14%, transparent);
  }
</style>
