<script lang="ts">
  import { t, i18nState } from '$lib/state/i18n.svelte';
  import { useHoverConfig } from '$lib/state/hoverConfig.svelte';
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
    featuredVideo?.status === 'live'
      ? t('youtube.status.live', 'Live now')
      : t('youtube.status.upcoming', 'Upcoming')
  );

  let summary = $derived.by(() => {
    if (!featuredVideo) return '';
    if (!featuredVideo.description) {
      if (featuredVideo.status === 'live') {
        return `${featuredVideo.channelName} ${t('youtube.summary.live', 'is live right now.')}`;
      }
      return `${featuredVideo.channelName} ${t('youtube.summary.upcoming', 'has this one scheduled.')}`;
    }

    const paragraphs = featuredVideo.description.split(/\n\s*\n/);
    return paragraphs[0].trim();
  });

  let timingLabel = $derived.by(() => {
    if (!featuredVideo) return '';

    if (featuredVideo.status === 'live') {
      return featuredVideo.actualStartTime
        ? `${t('youtube.label.started', 'Started')} ${formatYoutubeDateTime(featuredVideo.actualStartTime, locale)}`
        : `${t('youtube.label.livefrom', 'Live from')} ${formatYoutubeDateTime(featuredVideo.publishedAt, locale)}`;
    }

    return featuredVideo.scheduledStartTime
      ? `${t('youtube.label.scheduled', 'Scheduled')} ${formatYoutubeDateTime(featuredVideo.scheduledStartTime, locale)}`
      : `${t('youtube.label.announced', 'Announced')} ${formatYoutubeDate(featuredVideo.publishedAt, locale)}`;
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
      type: ['h3', 'span'],
      selectors: ['.channel-pill', '.live-cta'],
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
          <span>
            {featuredVideo.status === 'live'
              ? t('youtube.link.watch', 'Open on YouTube')
              : t('youtube.link.stream', 'View stream page')} →
          </span>
        </a>
      </div>
    </div>
  </section>
{/if}

<style>
  .live-signal-container {
    /* YouTube's own red, and the video letterbox behind the player. Both fixed in every theme. */
    --youtube-brand: #ff0000;
    --youtube-accent: #ff4d00;
    --youtube-letterbox: #050608;
    /* Broadcast state reads the same everywhere, so these do not follow the scheme either. */
    --live-signal: #ff4e4e;
    --upcoming-signal: #ff8c00;
    --youtube-surface-base: var(--surface-base, color-mix(in srgb, var(--surface-page) 82%, transparent));
    --youtube-surface-elevated: var(--surface-elevated, color-mix(in srgb, var(--surface-page) 90%, transparent));
    --youtube-border: color-mix(in srgb, var(--youtube-brand) 12%, transparent);

    width: min(100%, 72rem);
    margin: 0 auto var(--space-6);
    position: relative;
    z-index: var(--z-raised);
    container-type: inline-size;
  }

  .live-signal-bar {
    display: grid;
    grid-template-columns: minmax(14rem, 20rem) minmax(0, 1fr) auto;
    gap: var(--space-5);
    align-items: center;
    padding: var(--space-5);
    border-radius: var(--radius-2xl);
    border: 1px solid var(--youtube-border);
    background:
      radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--youtube-brand) 8%, transparent), transparent 36%),
      linear-gradient(160deg, color-mix(in srgb, var(--youtube-surface-elevated) 96%, transparent), color-mix(in srgb, var(--youtube-surface-base) 98%, transparent));
    box-shadow: var(--shadow-md);
    isolation: isolate;
    position: relative;
    transition:
      transform var(--duration-slow) var(--ease-out),
      border-color var(--duration-slow) var(--ease-out),
      box-shadow var(--duration-slow) var(--ease-out);
  }

  .live-signal-bar::before {
    content: '';
    position: absolute;
    inset: var(--space-3);
    border-radius: calc(var(--radius-2xl) - var(--space-3));
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
    border-radius: var(--radius-xl);
    border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    background: var(--youtube-letterbox);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 4%, transparent),
      var(--shadow-md);
    overflow: hidden;
    isolation: isolate;
    clip-path: inset(0 round var(--radius-xl));
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
    background: var(--youtube-letterbox);
  }

  .player-frame {
    position: absolute;
    inset: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 0;
    background: var(--youtube-letterbox);
  }

  .indicator-row,
  .live-cta {
    font-family: var(--font-body);
  }

  .indicator-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  .platform-badge,
  .live-indicator,
  .channel-pill {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: var(--text-2xs);
    line-height: 1;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .platform-badge {
    background: var(--youtube-brand);
    color: var(--text-on-accent);
    box-shadow: 0 0 var(--space-4) color-mix(in srgb, var(--youtube-brand) 24%, transparent);
  }

  .live-indicator,
  .channel-pill {
    border: 1px solid color-mix(in srgb, var(--youtube-brand) 22%, transparent);
    background: color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    color: inherit;
    gap: var(--space-2);
  }

  .live-indicator.live {
    border-color: color-mix(in srgb, var(--live-signal) 30%, transparent);
    background: color-mix(in srgb, var(--live-signal) 12%, transparent);
    color: color-mix(in srgb, var(--live-signal) 72%, currentColor 28%);
  }

  .live-indicator.upcoming {
    border-color: color-mix(in srgb, var(--upcoming-signal) 30%, transparent);
    background: color-mix(in srgb, var(--upcoming-signal) 12%, transparent);
    color: color-mix(in srgb, var(--upcoming-signal) 72%, currentColor 28%);
  }

  .indicator-dot {
    width: var(--space-2);
    height: var(--space-2);
    border-radius: var(--radius-round);
    background: currentColor;
    box-shadow: 0 0 var(--space-3) currentColor;
    animation: live-pulse 1.5s infinite;
  }

  .live-copy {
    display: grid;
    gap: var(--space-3);
  }

  .live-title {
    margin: 0;
    font-family: var(--font-body);
    line-height: 1.12;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .live-summary {
    margin: 0;
    font-family: var(--font-ui);
    font-size: clamp(var(--text-sm), calc(400cqw / (var(--summary-len) + 150)), var(--text-base));
    line-height: 1.6;
    opacity: 0.9;
    display: -webkit-box;
    line-clamp: 2;
    box-orient: vertical;
    overflow: hidden;
  }

  .live-meta {
    margin: 0;
    font-family: var(--font-ui);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.65;
  }

  .live-cta-container {
    padding-left: var(--space-4);
  }

  .live-cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    color: color-mix(in srgb, var(--youtube-brand) 82%, currentColor 18%);
    text-decoration: none;
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition:
      color var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
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
      gap: var(--space-5);
      border-radius: var(--radius-xl);
    }
    .preview-frame {
      border-radius: var(--radius-lg);
      clip-path: inset(0 round var(--radius-lg));
    }
    .live-summary {
      line-clamp: 3;
    }
  }

  :global([data-theme="cyber-neotic"]) .live-signal-bar {
    box-shadow:
      var(--shadow-lg),
      0 0 var(--space-5) color-mix(in srgb, var(--youtube-brand) 10%, transparent);
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
  }

  :global([data-theme="cyber-neotic"]) .preview-frame {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, white 8%, transparent),
      var(--shadow-md),
      0 0 var(--space-4) color-mix(in srgb, var(--youtube-brand) 14%, transparent);
  }
</style>
